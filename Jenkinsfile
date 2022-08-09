import org.jenkinsci.plugins.pipeline.modeldefinition.Utils
import java.text.SimpleDateFormat


DOCKER_IMAGE_NAME = ''
DOCKER_IMAGE      = ''
DOCKER_ARGS       = '--network=services_default'
DOCKER_REGISTRY   = 'registry.n-os.org:5000'


properties([
    disableConcurrentBuilds(),
    parameters([
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Do you want to run the build with tests?')
    ])
])


node {
    try {
        pipeline()
    }
    catch(e) {
        setBuildStatus(e.toString().take(140), 'FAILURE')
        throw e
    }
    finally {
        cleanup()
    }
}


/*
  ******************************************************************

  standard functions
  these functions below implement the standard docker image pipeline

  ******************************************************************
*/
def pipeline() {

    stage('checkout git') {
        checkout scm
        setBuildStatus('In progress...', 'PENDING')
    }

    // https://docs.cloudbees.com/docs/admin-resources/latest/plugins/docker-workflow
    stage('build image') {
        DOCKER_IMAGE_NAME = "${DOCKER_REGISTRY}/${getDockerImage()}:${getDockerTag()}"
        DOCKER_IMAGE = docker.build(DOCKER_IMAGE_NAME, "--no-cache ${DOCKER_ARGS} .")
    }

    stage('run tests') {
        if (fileExists('./test/run.sh') && !params.SKIP_TESTS) {
            DOCKER_IMAGE.inside("${DOCKER_ARGS} --entrypoint=") {
                sh 'bash /usr/build/test/run.sh'
            }
        }
        else {
            Utils.markStageSkippedForConditional('run tests')
        }
    }

    stage('push image') {
        if (BRANCH_NAME == 'master') {
            DOCKER_IMAGE.push()
        }
        else {
            Utils.markStageSkippedForConditional('push image')
        }
    }

    stage('delete image') {
        if (BRANCH_NAME == 'master') {
            Utils.markStageSkippedForConditional('delete image')
        }
        else {
            deleteDockerImage(DOCKER_IMAGE_NAME)
        }
        setBuildStatus('Success', 'SUCCESS')
    }
}

void deleteDockerImage(image) {
    sh(script: "docker rmi -f ${image}")
}

void cleanup() {
    stage('schedule cleanup') {
        build job: '/maintenance/starter', wait: false
    }
}

String getDockerImage() {
    return sh(script: "echo '${JOB_NAME}' | awk -F/ '{print \$(NF-1)}' | sed 's%docker-%%'", returnStdout: true).trim()
}

String getDockerTag() {
    def shortHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    def date = new Date()
    def sdf = new SimpleDateFormat("yyyyMMddHHmmss")
    // semver in TAG_ID file or reference to ARG in Dockerfile
    if (!fileExists('./TAG_ID')) {
        return "${sdf.format(date)}.${shortHash}.b${BUILD_ID}"
    }
    def tagId = sh(script: 'cat ./TAG_ID', returnStdout: true).trim()
    if (tagId ==~ /^[A-Z_]+$/) {
        return sh(script: "awk -F= '/ARG ${tagId}=/{print \$2}' Dockerfile", returnStdout: true).trim()
    }
    else {
        return tagId
    }
}

void setBuildStatus(message, state) {
  def repoUrl = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()
  step([
      $class: "GitHubCommitStatusSetter",
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: repoUrl],
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}

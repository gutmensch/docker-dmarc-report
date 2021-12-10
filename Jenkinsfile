DOCKER_IMAGE = ''
DOCKER_ARGS = '--network=services_default'
DOCKER_REGISTRY = 'registry.n-os.org:5000'
DOCKER_REPO = "${JOB_BASE_NAME}"

properties([
    parameters([
        string(defaultValue: 'trafex/alpine-nginx-php7:2.0.2', name: 'UPSTREAM_IMAGE', description: "Upstream docker image to start with")
    ])
])

node {
    try {
        setBuildStatus('build started', 'PENDING')
        pipeline()
        setBuildStatus('build succeeded', 'SUCCESS')
    }
    catch(e) {
        setBuildStatus('build failed', 'FAILURE')
        throw e
    }
    finally {
        cleanup()
    }
}

def pipeline() {
    stage('checkout') {
        checkout scm
    }

    stage('image build') {
        DOCKER_IMAGE = docker.build(
            "${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_ID} ",
            "--build-arg UPSTREAM_IMAGE=${UPSTREAM_IMAGE} " +
            "--no-cache ${DOCKER_ARGS} ."
        )
    }

    // stage('run tests') {
    //     DOCKER_IMAGE.inside("${DOCKER_ARGS} --entrypoint=") {
    //         sh 'bats /usr/build/test/*.bats'
    //     }
    // }

    stage('push image') {
        def shortHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        DOCKER_IMAGE.push()
        DOCKER_IMAGE.push(shortHash)
    }
}

def cleanup() {
    stage('schedule cleanup') {
        build job: '../Maintenance/dangling-container-cleanup', wait: false
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

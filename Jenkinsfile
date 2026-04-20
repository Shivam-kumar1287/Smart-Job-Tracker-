pipeline {
    agent any

    environment {
        NODE_JS_TOOL = 'node' // Name of the NodeJS tool configured in Jenkins
    }

    stages {
        stage('Initialize') {
            steps {
                echo 'Building Smart Job Tracker...'
                script {
                    if (isUnix()) {
                        sh 'node -v'
                        sh 'npm -v'
                    } else {
                        bat 'node -v'
                        bat 'npm -v'
                    }
                }
            }
        }

        stage('Backend: Install Dependencies') {
            steps {
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                        } else {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        stage('Frontend: Install & Build') {
            steps {
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Backend: Test (Placeholder)') {
            steps {
                dir('backend') {
                    echo 'Ready for testing...'
                    // sh 'npm test' // Uncomment when tests are added
                }
            }
        }
    }

    post {
        success {
            echo 'Build Successful!'
        }
        failure {
            echo 'Build Failed. Please check the logs.'
        }
    }
}

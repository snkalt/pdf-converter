pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/sujay37/pdf-conversion-app.git', branch: 'master'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t sujay37/pdf-conversion-app .'
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([string(credentialsId: 'docker-hub-credentials', variable: 'DOCKER_HUB_PASS')]) {
                    sh 'docker login -u sujay37 -p $DOCKER_HUB_PASS'
                    sh 'docker push sujay37/pdf-conversion-app'
                }
            }
        }
        stage('Deploy') {
            steps {
                // Add deployment steps here (for example, Kubernetes deployment or SSH to a server)
            }
        }
    }
}

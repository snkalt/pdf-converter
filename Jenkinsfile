pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo/pdf-conversion-app.git', branch: 'master'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t your-dockerhub-username/pdf-conversion-app .'
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([string(credentialsId: 'docker-hub-credentials', variable: 'DOCKER_HUB_PASS')]) {
                    sh 'docker login -u your-dockerhub-username -p $DOCKER_HUB_PASS'
                    sh 'docker push your-dockerhub-username/pdf-conversion-app'
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

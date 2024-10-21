pipeline {
    agent any
    environment {
        SONAR_HOME = tool "Sonar"
    }
    stages {
        stage("Code") {
            steps {
                git url: "https://github.com/snkalt/pdf-converter", branch: "master"
                echo "Code Cloned Successfully"
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar') {
                    sh '''
                    /bin/zsh -c "sonar-scanner \
                    -Dsonar.projectKey=pdf-converter \
                    -Dsonar.projectName=pdf-converter \
                    -Dsonar.login=${sqa_68a8af1c2802fda1fb6a440acda9f25cf7381023}"
                    '''
                }
            }
        }
        stage("SonarQube Quality Gates") {
            steps {
                timeout(time: 2, unit: "MINUTES") { // Adjusted timeout for longer analyses
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        stage("OWASP") {
            steps {
                dependencyCheck additionalArguments: '--scan ./', odcInstallation: 'OWASP'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage("Build & Test") {
            steps {
                sh '/bin/zsh -c "docker build -t pdf-converter:latest ."'
                echo "Code Built Successfully"
            }
        }
        stage("Trivy") {
            steps {
                script {
                    def trivyResult = sh(script: "/bin/zsh -c 'trivy image pdf-converter:latest'", returnStatus: true)
                    if (trivyResult != 0) {
                        error "Trivy found vulnerabilities in the Docker image."
                    }
                }
            }
        }
        stage("Push to Private Docker Hub Repo") {
            steps {
                withCredentials([usernamePassword(credentialsId: "DockerHubCreds", passwordVariable: "dockerPass", usernameVariable: "dockerUser")]) {
                    sh "/bin/zsh -c 'docker login -u ${env.dockerUser} -p ${env.dockerPass}'"
                    sh "/bin/zsh -c 'docker tag pdf-converter:latest ${env.dockerUser}/pdf-converter:latest'"
                    sh "/bin/zsh -c 'docker push ${env.dockerUser}/pdf-converter:latest'"
                }
            }
        }
        stage("Deploy") {
            steps {
                sh "/bin/zsh -c 'docker-compose up -d'"
                echo "App Deployed Successfully"
            }
        }
    }
}

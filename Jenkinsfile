pipeline {
    agent any
    environment {
        SONAR_HOME = tool "Sonar"
        TMPDIR = '/Users/sujaykumbhar/jenkins_temp' // Move TMPDIR here
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
                    echo "Current Directory:"
                    pwd
                    echo "Files in the directory:"
                    ls -la
                    /bin/zsh -c "sonar-scanner -Dsonar.projectKey=pdf-converter -Dsonar.projectName=pdf-converter -Dsonar.login=${sqa_68a8af1c2802fda1fb6a440acda9f25cf7381023}"
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
                sh 'docker build -t pdf-converter:latest .'
                echo "Code Built Successfully"
            }
        }
        stage("Trivy") {
            steps {
                script {
                    def trivyResult = sh(script: "trivy image pdf-converter:latest", returnStatus: true)
                    if (trivyResult != 0) {
                        error "Trivy found vulnerabilities in the Docker image."
                    }
                }
            }
        }
        stage("Push to Private Docker Hub Repo") {
            steps {
                withCredentials([usernamePassword(credentialsId: "DockerHubCreds", passwordVariable: "dockerPass", usernameVariable: "dockerUser")]) {
                    sh "docker login -u ${env.dockerUser} -p ${env.dockerPass}"
                    sh "docker tag pdf-converter:latest ${env.dockerUser}/pdf-converter:latest"
                    sh "docker push ${env.dockerUser}/pdf-converter:latest"
                }
            }
        }
        stage("Deploy") {
            steps {
                sh "docker-compose up -d"
                echo "App Deployed Successfully"
            }
        }
    }
}

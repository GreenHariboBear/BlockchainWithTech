!/bin/bash


# Install curl
sudo apt install curl;


# Installing Docker


#Setting repository
sudo apt-get update;
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common;
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -;
sudo apt-key fingerprint 0EBFCD88;
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable";

#INSTALL DOCKER CE
sudo apt-get update;
sudo apt-get install docker-ce;

#Verify that Docker CE
sudo docker run hello-world;

#Install Docker Compose
sudo apt install docker-compose;

#Installing Node.js and npm
sudo bash -c "cat >/etc/apt/sources.list.d/nodesource.list" <<EOL
deb https://deb.nodesource.com/node_6.x xenial main
deb-src https://deb.nodesource.com/node_6.x xenial main
EOL
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update
sudo apt install nodejs
sudo apt install npm
sudo apt update;

#Install go
sudo curl -O https://storage.googleapis.com/golang/go1.9.2.linux-amd64.tar.gz;
sudo tar -xvf go1.9.2.linux-amd64.tar.gz;
sudo mv go /usr/local;
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile;
source ~/.profile;

#Installing Hyperledger Fabric Docker Images and Binaries
curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0;
docker images;

#Installing Hyperledger Fabric
export PATH=$PWD/bin:$PATH;
git clone https://github.com/hyperledger/fabric-samples.git;

#Getting Started with Your First Network
cd fabric-samples/first-network;
./byfn.sh -m generate;
./byfn.sh -m up;


# **********Version needed for nodejs  is v8.9.4 so after installing upgrade or downgrade accordingly**************
# **********Versiob needed for npm is v3.10.10  so after installing upgrade or downgrade accordingly***************

 # Learn Data Advocacy 
This is a website that can be used to teach data literacy through the user’s ability to be in three different roles—artist, journalist, and detective. The different roles connect to each other for multiple users to be able to create a data advocacy campaign at once. 

This website is a part of an [NSF-funded project](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2016982&HistoricalAwards=false) project that aims to develop and investigate a technology-enhanced learning environment to engage youth from historically underserved communities in learning data literacy concepts and skills as they relate to the use of data for social advocacy. The ultimate goal is for our program to foster data literacy skills that can build understanding amongst youth of how data and data-driven processes influence their lives and communities, thereby fostering a strong civic identity and ideas for action. 

## Prerequisites
1. [Clojure](https://clojure.org/guides/install_clojure)
2. [JDK 11 ](https://adoptopenjdk.net/releases.html)
3. [NodeJS 16](https://github.com/nvm-sh/nvm) 
4. [Yarn Classic](https://classic.yarnpkg.com/en/docs/install#windows-stable)
<details>
<summary> 
<h3>Step by Step Prerequisites Installation Directions   </h3>
</summary>

1. Update the list of available packages and versions 
    ```
    sudo apt update
     ``` 
2. Update Ubuntu
    ```
    sudo apt upgrade
    ```
3. Install java
     ```
    sudo apt install openjdk-11-jdk
    ```
4. Install [Node.js](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm)
    ```
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
    ```
      * Verify its installed with 
        ```
        command -v nvm
        ```
      * Install Node version 16 with 
        ```bash
        nvm install 16
        ```
      * Verify its installation with
        ```
        node -v
        ```
5. Install yarn (Installation | Yarn (yarnpkg.com) 
    ```
    npm install --global yarn
    ```
    * Verify download with
      ```
      yarn --version
      ```
6. Install clojure (https://clojure.org/guides/install_clojure)
    * Verify its installation with 
      ```
      clj -h
      ```
    * Troubleshooting: 
      - You may need to install dependencies like ```rlwrap``` with 
      ```
      sudo apt install rlwrap
      ```
</details>

### Windows Specific Prerequisites
1. Install WSL
    * Open a command line as administrator and run the following command to install WSL and Ubuntu
    ```
    wsl --install
    ```
    * Verify that you receive a message about ubuntu being installed 
    * Reboot PC
    * Open wsl with wsl in the command line (run as normal user)
    * Troubleshooting:
      * Retry installing WSL
        ```
        wsl --install #verify you are in admin mode
        ```
2. Reset your distro
    * If you are unsure of the distro installed (ubuntu is default) you can run
      ```
      wsl -–list
      ```
    * Unregister distro
       ```
      wsl --unregister ubuntu
      ```
    * Reinstall distro
       ```
        wsl --install ubuntu
        ```
    * Troubleshooting:
      * Reset your distro, you will lose any data stored in ubuntu and have a fresh install

## Installation Instructions
1. Clone the repository 
    ```
    git clone  https://github.com/zrisha/metabase
     ```
2. In the root directory add the .env file that specifies environment variables
    * Add the Google credentials file
3. Prep the clojure dependencies
    ```
    clojure -X:deps prep
    ```
4. Build the repository 
    ```
    yarn build
    ```
## Running the Platform (Development) 
1. Run the backend
    * Source the env file. 
      ```
      . .env
      ```
2. Run clojure -M:run
3. Run the frontend 
    ```
    yarn build-hot
    ```
4. Access in your browser: http://localhost:3000/

## Acknowledgments

This project is a [Metabase fork of version 0.42](https://www.metabase.com/docs/v0.42/). 


## Building the Platform (Deployment)
See official documents [here](https://www.metabase.com/docs/v0.42/developers-guide/build)

## License

This repository contains the source code for both the Open Source edition of Metabase, released under the AGPL, as well as the commercial edition of Metabase Enterprise, released under the Metabase Commercial Software License. 

See [LICENSE.txt](./LICENSE.txt) for details.

Unless otherwise noted, all files © 2022 Metabase, Inc.


**********
Contribute
**********
- Clone this repo
- Navigate to folder **app** & hit **npm install**
- Copy file **.env_example** & rename to **.env**
- Run **npm start**
- Enjoy!!!
	
	If getting error after hit command **npm install**, try using **npm install --save --legacy-peer-deps**

******************
Build & Deployment
******************
- In the very first step, we will create a sub-directory in the root domain directory. So, by default, we have the **public_html** directory for a domain that is mapped inside the cPanel. Now, assuming, you have a domain named **example.com** having a **public_html** root directory. But, we want to host React application in a sub-directory named **app** inside **the public_html**
- At the initial step, open the project in any editor (VS Code / Sublime 3) you need to navigate to the **package.json** file available in the root of project directory
- Then Add/change an attribute named **homepage** to **"homepage: "/app"**
- In the next step, we will need to update **.env** named **REACT_APP_BASE_ROUTER** to **REACT_APP_BASE_ROUTER=/app**
- Next, we need to make a build of the application so that we can deploy it on production. For making a build, hit **npm run build**
- After process build complete and new folder **build** appear in root folder
- Compress the folder **build** to .zip or any kind, then extract the file **build.zip** to **public_html/app**
- Or copy all files inside **build** folder to **public_html/app**
- After extract completed, then delete the xxx.zip in your *public_html*
- Enjoy!!!

	- If you want to try in **localhost/apache**, assuming **public_html** above is **/var/www/html** (in linux version)
	- If using extract method, make sure deleting the **build.zip** file inside the **/app** folder after extracting completed
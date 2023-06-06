************
Contribute :
************
- clone this repo
- cd to folder *app* & hit *npm install*
- copy file *.env_example* & rename to *.env*
- run `npm start`
- enjoy!!!
	
- **NOTE :**
	- **If getting error after hit command `npm install`, try using `npm install --save --legacy-peer-deps`**



************************
Build & Running in Local
************************
- cd to folder *app* & hit *npm run build*
- after process build complete and new folder called *build* appear in root folder, then hit *npx serve -s build*
- enjoy!!!

- **NOTE :**
	- **Dont Forget to set .env file correctly before hit `npm run build`**
	- **If getting prompt after hit command `npx serve -s build`, just type `y` then press Enter**


*************************
Build & Deployment
*************************
- **For Static**
	- cd to folder *app*
	- change property in *package.json* file called *homepage*, change to base on url hosting or domain like an example *https://namadomain.com*
	- hit *npm run build*
	- after process build complete and new folder `build` appear in root folder
	- compress the folder *build* to .zip or etc
	- copy/upload to *public_html* in your static hosting, then extract the file
	- after extract completed, then delete the xxx.zip in your *public_html*
	- enjoy!!!

- **For CRA**
	- follow this link if using Vercel https://vercel.com/guides/deploying-react-with-vercel
	
- **NOTE :**
	- **For Static or CRA host using different process either, depend on Static or CRA your using for deployment**
# points
personal project for trying out webworker and AssemblyScript

Upon page render a blinking animation is started. This animations is done by changing alpha property of every pixel in AssemblyScript. 
At the same time you can provide a file with points and the site will find all squares that can be formed from those points in webWorker thread.

In the assets folder there are couple of files with points in required format that can be used for testing.


To build asm files run `npm run asbuild`.

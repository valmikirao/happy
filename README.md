# happy
## Summary

My new game to help you be happy!

## Getting started

To install and run:

```
git clone git@github.com:valmikirao/happy.git
cd happy
npm install
npm run build
npm run mongod

# in a separate command prompt
npm start
```

Then go to [http://localhost:8000/static/happy-list.html](http://localhost:8000/static/happy-list.html) and have fun!

## To do/Apologia

Things I probably could have done better, technically:

- I am probably connecting to mongo wrong
- Right now, I'm running the mongo db and the app server in the same EC2 instance in 'production' (such as it is).  This is not how you're supposed to do this
- I need to organize this code better, especially Redux stuff
- Including too many inline functions
- Jenkins/Docker deployment, maybe?
- The security is obviously pretty basic and not very secure at this point
- Probably other things

Features to do:
- For god sakes, make this look better
- Including more game-like indications when you do something wrong or right
- There should be some way to preview all the existing sentences.
- Ability to edit and add sentences in the app

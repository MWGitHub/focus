# Focus (Temporary name)

Focus is a website that allows users to manage their tasks. It differs from other task lists by setting rules on when
tasks are set, deleted, and updated.

## Installation

Install postgresql and set up the database that will be used for the application.
Install redis for storing sessions.

Edit knexfile-sample.js with your database credentials.  
Rename the file to knexfile.js

Install redis and run it before starting the server.

Edit config-sample.json and replace the key with your own key.  
Rename the config file to config.json

Run in the server folder:  
`npm install`  
`./node_modules/.bin/knex migrate:latest`

#### If not using a web server
Run in the client folder:  
`npm install`

## Usage

Start the server by going to the server folder and running:  
`node .`

#### If not using a web server
Start the client server by going to the client folder and running:  
`node .`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

TODO: Write license
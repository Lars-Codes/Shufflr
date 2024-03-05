
# Shufflr
<p align="center">
  <img src="/shufflr.png" alt="Shufflr Logo" width="500">
</p>

Welcome to Shufflr! Have you ever wanted to search for a song in your library on Spotify, but forgot the name of the album it is on? Have you ever wanted to shuffle through all of the tunes in your albums, liked songs, and playlists but struggle to keep track of a "master album?" Have you ever been bugged by the bias in Spotify's shuffle tool, and wanted a truly random shuffle experience? Well, then Shufflr is the Spotify application for you! Whether you're a casual listener or a stereophile, Shufflr is guaranteed to enhance your music library experience. 

### Technology Stack 
- Vanilla JavaScript
- HTML/CSS
- Node.js
- Express.js
- Spotify Web API
- OAuth
- CORS middleware
- Cookie parsing
- Processing.js

## Table of Contents

- [Project Name](#project-name)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction
Welcome to Shufflr! 

Welcome to Shufflr! When I switched from Apple Music to Spotify, I was surprised that there was not a way for me to shuffle through my entire music library. On Apple Music, when you add an album to your library, all of the songs from that album are added to an "all songs" tab where the user can listen to all of the music they have ever downloaded. On Spotify, the song-search feature only works from within a playlist. This frustrated me when I tried to search for specific songs, but could not remember the artist's name or the album name.

For a while, I tried to maintain my own "all songs" playlist. Every time I added an album to my library, I would add all of the songs in that album to my playlist. However, I would frequently forget if I had added an album or not, and every time I deleted an album, I would have to individually remove all of those songs from my playlist.

Spotify's shuffle tool favors songs you listen to more frequently. This frustrated me because I enjoy the experience of listening to songs I have not heard in a while.

That is when I decided to create Shufflr. I realized I could utilize Spotify's APIs to generate an empty playlist, fetch all of the user's albums, playlists, and liked songs and dump them inside of this empty playlist. I would also include a mechanism to automatically update the playlist when the user adds or removes songs or albums from their library. Then, I could create a tool where a user types in the name of a playlist and the number of random songs they would like to be added to their queue.

## Features

### User-Facing Features 
- Create All-Songs Playlist 
Creates a new playlist with all of the songs from the albums in your library and your liked songs playlist.
- Update All-Songs Playlist 
Update your preexisting all-songs playlist to reflect the most up-to-date version of your music library. 
- Random Shuffle Tool 
Add a given number of songs to your queue, randomly selected from a specified playlist. 
- Custom loading game 
Play with an umbrella on a rainy day while waiting for your playlist to load. 

### Backend Features 

- OAuthorization with PKCE
- Spotify API Integration 
- Session management using cookies 
- CORS Middleware 

## Getting Started

### Prerequisites 

You must have node.js and npm package manager installed on your machine. Installation instructions can be found [here]([URL](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)).

### Creating a Spotify Developer Account 
In order to create a local version of this app, you must create an account with Spotify for Developers. You can do that [here]([URL](https://developer.spotify.com/)). Once you create an account, follow the instructions below: 

1. Click on "create an app."
2. Give your application a name and a description. You can leave the "website" field empty.
3. The redirect URI should be http://localhost:5173/callback. If you want to use another port, you can change 5173 to your desired port number.

### Installation

1. **Clone the Repository**: 
   Clone the Shufflr repository to your local machine using Git:
``` bash
  git clone https://github.com/Lara-Codes/Workout-World.git](https://github.com/Lara-Codes/Shufflr.git
```

2. **Install dependencies**:

``` bash
  npm i 
```

4. **Environment Variables**:
In the server directory, create a .env file and add the following lines:
```plaintext
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PORT=3000
REDIRECT_URI=http://localhost:5173/callback
```
Your client ID and client secret can be found on your Spotify for Developers Application Dashboard. 

5. **Run Application**:
   Run the application with the following command, and navigate to localhost:5173 (or the port you are choosing to run the application on). 
``` bash
  npm run dev 
```

## Contributing

I welcome contributions from the community! Whether you're a developer, designer, tester, or documentation enthusiast, there are many ways to contribute to our project. Here's how you can get involved:

### Code Contributions
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make your changes and ensure the code follows our coding standards.
- Test your changes thoroughly.
- Submit a pull request with a clear description of your changes.

### Reporting Bugs

If you encounter any bugs or issues while using our application, please let us know by [opening an issue](https://github.com/Lara-Codes/Shufflr/issues) on GitHub. Be sure to provide detailed steps to reproduce the issue and include any relevant screenshots or error messages.

### Suggesting Enhancements

Have an idea for a new feature or improvement? I'd love to hear it! [Open an issue](https://github.com/Lara-Codes/Shufflr/issues) on GitHub and share your thoughts. I'm always looking for ways to make my applications better, and your feedback is invaluable.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



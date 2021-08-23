# csgo-tracker
![CI for csgo-tracker](https://github.com/davidaf3/csgo-tracker/actions/workflows/csgo-tracker.yml/badge.svg)

csgo-tracker is a simple [Electron](https://www.electronjs.org/) app that lets you track your CS:GO matches and stats using [Valve's game state integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration).

## Features
- Keep track of your CS:GO stats and matches.
- Get real time updates about your performance in the current match.
- No ads, no account needed, everything is stored locally.

<img src="screenshot1.png" alt="screenshot1" width="800"/>
<img src="screenshot2.png" alt="screenshot2" width="800"/>

## Installation
You can download the latest stable release for your OS [here](https://github.com/davidaf3/csgo-tracker/releases). Also, you can download the latest build from the [Actions tab](https://github.com/davidaf3/csgo-tracker/actions) (you have to be logged into your GitHub account). 

The downloaded .zip folder will contain a .cfg file and an executable file. Before installing or running the app you need to place the .cfg file into the csgo/cfg directory inside the CS:GO installation folder.

To install the Windows version, you have to run the installer file. The Linux version is an [AppImage](https://appimage.org/) so you can just run the executable to start the app.

## Usage
To track a match, you have to run csgo-tracker **before** starting the match. If you close the app before the match ends, the match stats will be incomplete. 

To access your match history, go to the Matches tab. A list of matches will appear on the left hand side of the screen. Then you can click on any item of the list to see your performance in each match. You can also see your performance in any round by clicking on the chart at the bottom of the screen.
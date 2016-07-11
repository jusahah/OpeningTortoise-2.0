# OpeningTortoise 2.0

## What is it?

An Electron application for training openings. It allows you to search for key positions from you own games, and then quizzes you about those positions. 

Application includes wrapper for analysing games. Default analysis engine is Stockfish. Application assumes you have Stockfish installed and that it can be invoked through shell command "stockfish".

It also allows you to track the positions occurring in your games as you play them. It does this
by taking periodically screenshots of your online chess board and figuring out the position on board.
This functionality uses ChessPositionRecognizer as a dependency and is nowhere near error-free at the moment.
Currently only chess.com board layout is supported. ChessPositionRecognizer is work-in-progress.

### MIT LICENCE etc.
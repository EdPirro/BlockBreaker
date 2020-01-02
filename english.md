Block Breaker
=============

Block Breaker is a simple yet engaging game of matching block colors. Your goal is to make lines of 3 or more blocks and get the most points you can!

Block Breaker is made entirely in plain javascript and html, to play it you just need to open the [.html file](index.html) in any browser.

How to play
-----------

The game is very simple, you just need to click two adjacent blocks to swap their positions and make lines of 3* or more blocks of the same color to be awarded points as following:
  
  - 3 blocks in a line: 10 points.
  - 4 blocks in a line: 30 points.
  - 5 blocks in a line: 50 points.

If both a horizontal and a vertical line can be made the line that awards more points will be considered.

<sub><sup> *The number of blocks needed for a line to award points is dependent to the "blockThreshold" constant. Everything stated in this readme takes into consideration a threshold of 2 blocks, that means that you can have a maximuim of 2 blocks of the same color together without making a line.</sup></sub>

Game Modes
------------

Block Breaker features two different game modes. Upon loading the game you start in casual, and can freely change to challange mode at any time<sup>1</sup>.

|   Casual  | Challange  |
| :-------: | :-------:  |
|Points don't count towards High Score | Points count towards High Score |
|No points are lost | Every turn you lose points<sup>2 |
|||

<sub><sup>1: You wont be able to change modes if any animation is on going, when you change game modes the game is resetted. <br/>
2: The amount of points lost each turn is the number of moves you've done since.</sup></sub>

Support
-------

If you are having any issues, please let me know.<br/>
Contact me at edpirro.ep@gmail.com.

License
-------

The project is licensed under the [MIT license](LICENSE).

Repository
----------

[Back to the repository page.](github.com/EdPirro/$project)
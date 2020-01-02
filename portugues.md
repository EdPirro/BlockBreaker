Block Breaker
=============

Block Breaker é um simples mas envolvente jogo de cobinar cores de blocos. Seu objetivo é alinhar 3 ou mais blocos e conseguir o máximo de pontos que puder!

Block Breaker é feito em javascrit e html plenos, para joga-lo você so precia abrir o [arquivo .html](index.html) em qualquer browser.

Como Jogar
-----------

O jogo é muito simples, você so precisa clicar em dois blocos adjacentes para troca-los de posição e fazer linhas de 3* ou mais blocos de mesma cor afim de ganhar pontos da seguinte maneira:
  
  - 3 blocos alinhados: 10 pontos.
  - 4 blocos alinhados: 30 pontos.
  - 5 blocos alinhados: 50 pontos.

Se uma linha na horizontal e na vertical, puderem ser feitas ao mesmo tempo, será considerada aquela que der mais pontos.

<sub><sup> *O numero de blocos necessário para atribuir pontos  é dependente da constante "blockThreshold". A descrição feita nesse arquivo leva em consideração um limite de 2 blocos, o que significa que o numero maximo de blocos da mesma cor que podem ficar pertos sem formar uma linha é 2.</sup></sub>

Modos de Jogo
------------

Existem 2 modos distintos de jogo em Block Breaker. Ao iniciar o jogo voce começará no modo Casual, e podera mudar livremente de modo a qualquer momento<sup>1</sup>.

|   Casual  | Challange  |
| :-------: | :-------:  |
|Pontos não contam pro High Score | Pontos contam pro High Score |
|Nenhum ponto é perdido | A todo turno você perde pontos<sup>2 |

<sub><sup>1: Você não pode mudar de modo de jogo enquanto alguma animação estiver acontecendo, ao mudar o modo de jogo ele será resetado. <br/>
2: A quantidade de pontos deduzida a cada turno é igual a quantidade de movimentos que foram feitos ate ele.</sup></sub>

Suporte
-------
Se estiver tendo qualquer prroblea, por favor me avise.<br/>
Contate-me em edpirro.ep@gmail.com.

Licença
-------

Esse projeto é licenciado pela [licença MIT](LICENSE) (em inglês).

Repositório
-----------

[Voltar à pagina do repositiório.](https://github.com/EdPirro/BlockBreaker)

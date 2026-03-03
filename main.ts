/*
File:      github.com/ETmbit/game.ts
Copyright: ETmbit, 2026

License:
This file is part of the ETmbit extensions for MakeCode for micro:bit.
It is free software and you may distribute it under the terms of the
GNU General Public License (version 3 or later) as published by the
Free Software Foundation. The full license text you find at
https://www.gnu.org/licenses.

Disclaimer:
ETmbit extensions are distributed without any warranty.

Dependencies:
None
*/


type poshandler = (x: number, y: number) => void

enum SpriteDir {
    //% block="up"
    //% block.loc.nl="omhoog"
    Up,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down,
    //% block="to the left"
    //% block.loc.nl="naar links"
    Left,
    //% block="to the right"
    //% block.loc.nl="naar rechts"
    Right
}

enum Visible {
    //% block="shown"
    //% block.loc.nl="wel zien"
    Yes,
    //% block="hidden"
    //% block.loc.nl="niet zien"
    No
}

let ETplay = false
let ETscore = 0

let gameStartHandler: handler
let gamePlayHandler: handler
let gameOverHandler: handler

Game.init()

basic.forever(function () {
    if (!ETplay) return
    if (gamePlayHandler) gamePlayHandler()
})

//% color="#00CC00" icon="\uf526"
//% block="Game"
//% block.loc.nl="Spel"
namespace Game {

    export class Sprite {

        draw: poshandler
        undraw: poshandler
        inField = true
        xpos = 0
        xsiz = 0
        ypos = 0
        ysiz = 0
        dir = SpriteDir.Up

        constructor(xsize: number, ysize: number,
                    drawSprite: poshandler, undrawSprite: poshandler) {
            this.draw = drawSprite
            this.undraw = undrawSprite
            this.xsiz = xsize
            this.ysiz = ysize
        }

        keepInField(infield: boolean) {
            this.inField = infield
        }

        x(): number {
            return this.xpos + Math.floor(this.xsiz / 2)
        }

        y(): number {
            return this.ypos + Math.floor(this.ysiz / 2)
        }

        sizeX(): number {
            return this.xsiz
        }

        sizeY(): number {
            return this.ysiz
        }

        direction(): SpriteDir {
            return this.dir
        }

        setDirection(direction: SpriteDir) {
            this.dir = direction
        }

        moveTo(x: number, y: number) {
            if (this.undraw)
                this.undraw(this.xpos, this.ypos)
            this.xpos = x - Math.floor(this.xsiz / 2)
            this.ypos = y - Math.floor(this.ysiz / 2)
            if (this.inField) {
                if (this.xpos < 0) this.xpos = 0
                if (this.ypos < 0) this.ypos = 0
                if (this.xpos > 4) this.xpos = 4
                if (this.ypos > 4) this.ypos = 4
            }
            if (this.draw)
                this.draw(this.xpos, this.ypos)
        }

        moveDir(steps: number) {
            switch (this.dir) {
                case SpriteDir.Up:      this.moveTo(this.xpos, this.ypos - 1); break
                case SpriteDir.Down:    this.moveTo(this.xpos, this.ypos + 1); break
                case SpriteDir.Left:    this.moveTo(this.xpos - 1, this.ypos); break
                case SpriteDir.Right:   this.moveTo(this.xpos + 1, this.ypos); break
            }
        }

        moveRel(x: number, y: number) {
            this.moveTo(this.xpos + x, this.ypos + y)
        }

        moveRand() {
            let x = General.randomInt(0, 4)
            let y = General.randomInt(0, 4)
            this.moveTo(x, y)
        }

        show(doshow: boolean) {
            if (doshow) {
                if (this.draw)
                    this.draw(this.xpos, this.ypos)
            }
            else {
                if (this.undraw)
                    this.undraw(this.xpos, this.ypos)
            }
        }
    }

    export function createSprite(id: string, xsize: number, ysize: number,
                                 drawSprite: poshandler, undrawSprite: poshandler) : Sprite {
        let sprite = new Sprite(xsize, ysize, drawSprite, undrawSprite)
        sprites.push(sprite)
        ids.push(id)
        return sprite
    }

    let sprites: Sprite[] = []
    let ids: string[] = []

    export function init() {
        ETplay = false
        ETscore = 0
    }

    export function getSprite(id: string) : Sprite {
        for (let i = 0; i < sprites.length; i++) {
            if (ids[i] == id) return sprites[i]
        }
        return null
    }

    export function isPlaying(): boolean {
        return ETplay
    }

    //% block="collision of %id1 and %id2"
    //% block.loc.nl="botsing van %id1 en %id2"
    export function isCollision(id1: string, id2:string) : boolean {
        let s1 = getSprite(id1)
        let s2 = getSprite(id2)
        let xl1 = s1.x() - s1.sizeX() / 2
        let xr1 = s1.x() + s1.sizeX() / 2
        let yl1 = s1.y() - s1.sizeY() / 2
        let yr1 = s1.y() + s1.sizeY() / 2
        let xl2 = s2.x() - s2.sizeX() / 2
        let xr2 = s2.x() + s2.sizeX() / 2
        let yl2 = s2.y() - s2.sizeY() / 2
        let yr2 = s2.y() + s2.sizeY() / 2
        if (xl1 <= xr2 && xl1 >= xl2) {
            if (yl1 <= yr2 && yl1 >= yl2) return true
            if (yl1 <= yl2 && yr1 >= yr2) return true
            if (yl2 <= yr1 && yl2 >= yl1) return true
        }
        if (xl1 <= xl2 && xr1 >= xr2) {
            if (yl1 <= yr2 && yl1 >= yl2) return true
            if (yl1 <= yl2 && yr1 >= yr2) return true
            if (yl2 <= yr1 && yl2 >= yl1) return true
        }
        if (xl2 <= xr1 && xl2 >= xl1) {
            if (yl1 <= yr2 && yl1 >= yl2) return true
            if (yl1 <= yl2 && yr1 >= yr2) return true
            if (yl2 <= yr1 && yl2 >= yl1) return true
        }
        return false
    }

    //% block="have %id %displ"
    //% block.loc.nl="laat %id %displ"
    export function show(id: string, displ:Visible) {
        let sprite = getSprite(id)
        if (sprite) sprite.show(displ == Visible.Yes)
    }

    //% subcategory="Sprite"
    //% block="make %id move %dir"
    //% block.loc.nl="laat %id %dir gaan"
    export function setDirection(id: string, dir: SpriteDir) {
        let sprite = getSprite(id)
        if (!sprite) return
        sprite.setDirection(dir)
    }

    //% block="place %id somewhere"
    //% block.loc.nl="plaats %id ergens"
    export function moveRandom(id: string) {
        let sprite = getSprite(id)
        if (sprite) sprite.moveRand()
    }

    //% subcategory="Sprite"
    //% block="move %id %steps steps"
    //% block.loc.nl="beweeg %id %steps stappen"
    export function moveSteps(id: string, steps: number) {
        let sprite = getSprite(id)
        if (!sprite) return
        sprite.moveDir(steps)
    }

    //% subcategory="Sprite"
    //% block="move %id %steps steps %dir"
    //% block.loc.nl="beweeg %id %steps stappen %dir"
    export function moveDirection(id: string, steps: number, dir: SpriteDir) {
        let sprite = getSprite(id)
        if (!sprite) return
        sprite.setDirection(dir)
        sprite.moveDir(steps)
    }

    //% block="replace %id with (%xpos,%ypos)"
    //% block.loc.nl="verplaats A met (%xpos,%ypos)"
    export function moveRelative(id: string, xpos: number, ypos: number) {
        let sprite = getSprite(id)
        if (sprite) sprite.moveTo(xpos, ypos)
    }

    //% block="put %id at position (%xpos,%ypos)"
    //% block.loc.nl="plaats A op (%xpos,%ypos)"
    export function moveTo(id: string, xpos: number, ypos: number) {
        let sprite = getSprite(id)
        if (sprite) sprite.moveTo(xpos, ypos)
    }

    //% block="the score"
    //% block.loc.nl="het aantal punten"
    export function getScore() : number {
        return ETscore
    }

    //% block="show the score"
    //% block.loc.nl="laat de punten zien"
    export function showScore() {
        basic.clearScreen()
        basic.showNumber(ETscore)
    }

    //% block="stop the game"
    //% block.loc.nl="stop het spel"
    export function stopGame() {
        ETplay = false
        basic.clearScreen()
        General.wait(0.5) // blocks a possible latest button handling
        basic.showNumber(ETscore)
        General.wait(1)
        basic.showIcon(IconNames.Yes)
    }

    //% block="start the game"
    //% block.loc.nl="start het spel"
    export function startGame() {
        basic.clearScreen()
        if (gameStartHandler) gameStartHandler()
        ETscore = 0
        ETplay = true
    }

    //% block="when the game is over"
    //% block.loc.nl="wanneer het spel voorbij is"
    export function onGameOver(code: () => void) {
        gameOverHandler = code
    }
}

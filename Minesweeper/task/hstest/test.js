const puppeteer = require('puppeteer');
const path = require('path');
// '..' since we're in the hstest/ subdirectory; learner is supposed to have src3/index.html
// const pagePath = 'file://' + path.resolve(__dirname, '../src3/index.html');

const hs = require('hs-test-web');
const react = require("hs-test-web-server");

const sleep = (ms) => new Promise(res => setTimeout(res , ms));

async function stageTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-infobar'],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    let result;
    for (let i = 0; i < 9; i++) {
        const page = await browser.newPage();
        await page.goto('http://localhost:3010');
        await page.setDefaultNavigationTimeout(0);

        page.on('console', msg => console.log(msg.text()));
        let resultFirstPrt = await hs.testPage(page,

            //#test1
            /*
            поиск и запоминание элементов:
            * - cчётчик флагов по тексту '10'
            * - кнопка сброса  по курсору = pointer
            * - таймер         по тексту '0:00'
            * */
            () => {
                this.eventFire = function (e, type) {
                    let event = document.createEvent('Event');
                    event.initEvent(type, true, false);
                    e.dispatchEvent(event);
                };

                this.getCellByClass = function (clName, i) {
                    return document.getElementsByClassName(clName)[i]
                };

                this.isCellWithPicture = function (cell) {
                    let backgroundImage = window.getComputedStyle(cell).backgroundImage
                    return cell.children.length > 0 && cell.children[0].tagName.toLowerCase() === "img" || backgroundImage !== "none";
                };

                this.elements = {
                    flagCounter: undefined,
                    resetBtn: false,
                    clock: undefined
                };

                this.divs = new Map();
                let pointerClasses = new Map();
                Array.from(document.getElementsByTagName("*")).forEach(element => {
                    if (element.children.length > 1 ||
                        element.tagName === "SCRIPT" ||
                        element.tagName === "LINK" ||
                        element.tagName === "META" ||
                        element.tagName === "STYLE" ||
                        element.tagName === "NOSCRIPT") return;

                    let text = element.innerText;

                    if (text.includes('10'))
                        this.elements.flagCounter = element;
                    if (text.includes('0:00'))
                        this.elements.clock = element;

                    if (text === '') {
                        let width = window.getComputedStyle(element).width;
                        let height = window.getComputedStyle(element).height;
                        let divName = element.className;

                        if (width === height)
                            this.divs.has(divName) ?
                                this.divs.set(divName, this.divs.get(divName) + 1) :
                                this.divs.set(divName, 1)
                    }

                    if (window.getComputedStyle(element).cursor === "pointer") {
                        let [tag, className] = [element.tagName, element.className];

                        pointerClasses.has((tag, className)) ?
                            pointerClasses.set((tag, className), pointerClasses.get((tag, className)) + 1) :
                            pointerClasses.set((tag, className), 1);
                    }
                });

                if (!this.elements.flagCounter) {
                    return hs.wrong("There should be a flag counter that equals to '10'.")
                }
                if (pointerClasses.length === 0) {
                    return hs.wrong("There should be a reset button and if you hover the mouse over it, the cursor should change to the pointer.")
                }
                if (!this.elements.clock) {
                    return hs.wrong("There should be a timer that equals to '0:00'.")
                }

                return hs.correct()
            },
            //#test2
            /*
            * проверка, что поле содержит 72 клетки
            *
            * поиск по составленному ранее мапу такого класса, элементов которого 72 штуки
            * */
            () => {
                this.divs = Array.from(this.divs);
                if (!this.divs.find(([k, v]) => v === 72)) {

                  return hs.wrong("The field should contain 72 square cells with no inner elements inside.")
                }

                return hs.correct()
            },
            //#test3
            /*
            * проверка, что все яейки стоят ровно
            * */
            () => {
                let cells = Array.from(document.getElementsByClassName("cell"));

                if (cells.length === 0) {
                    return hs.wrong("Cells should have className='cell'");
                }

                let rows = new Map();
                let columns = new Map();
                cells.forEach(cell => {
                    let top = cell.getBoundingClientRect().top;
                    let left = cell.getBoundingClientRect().left;

                    rows.has(top) ?
                        rows.set(top, rows.get(top) + 1) :
                        rows.set(top, 1);

                    columns.has(left) ?
                        columns.set(left, columns.get(left) + 1) :
                        columns.set(left, 1);
                });

                rows = Array.from(rows);
                let isWrongRow = rows.find(([k, v]) => v !== 8);
                if (isWrongRow) return hs.wrong("Each row of the field should contain 8 cells.")

                columns = Array.from(columns);
                let isWrongColumn = columns.find(([k, v]) => v !== 9);
                if (isWrongColumn) return hs.wrong("Each column of the field should contain 9 cells.")

                return hs.correct()
            },
            //#test4
            /*
            * тест счётчика:
            *   - клик правой кнопкой на 2 => 8 в счётчике
            *   - ещё на 8 => 0 в счётчике
            *   - попробовать ещё => ничего не изменяется
            * */
            async () => {
                let arr = [58, 65];
                let res = true;
                arr.forEach((i, ind) => {
                    let cell = this.getCellByClass("cell", i);
                    this.eventFire(cell, 'contextmenu');
                    if (!this.isCellWithPicture(cell)) res = false
                });
                if (!res) return hs.wrong("The flagged cell should look different.");

                if (!this.elements.flagCounter.innerText.includes("8"))
                    return hs.wrong("The flag counter should decrease if you flag the cells.")

                arr = [3,8,14,22,35,38,41,55];
                arr.forEach((i, ind) => {
                    let cell = this.getCellByClass("cell", i);
                    this.eventFire(cell, 'contextmenu');
                });

                if (!this.elements.flagCounter.innerText.includes("0"))
                    return hs.wrong("The flag counter should be 0 if all 10 flags are placed.")

                let zeroCounter = this.elements.flagCounter.innerText;
                arr = [61, 70];
                arr.forEach((i, _) => {
                    let cell = this.getCellByClass("cell", i);
                    this.eventFire(cell, 'contextmenu');
                    if (this.isCellWithPicture(cell)) res = false
                });

                if (!res) return hs.wrong("If you placed all 10 flags, you can't flag cells any more.")

                if (this.elements.flagCounter.innerText !== zeroCounter)
                    return hs.wrong("The flag counter should be 0 if all 10 flags are placed and you try to flag more cells.")

                return hs.correct();
            },
            //#test5
            /*
            * сначала уберём все флаги из предыдущего теста и кликнем на 0 клетку
            * */
            () => {
                //перед этим уберем все флаги
                let arr = [58, 65,3,8,14,22,35,38,41,55 ];
                arr.forEach((i, ind) => {
                    let cell = this.getCellByClass("cell", i);
                    this.eventFire(cell, 'contextmenu');
                });
                //клик на 0 клетку
                let cell = this.getCellByClass("cell", 0);
                cell.click();

                return hs.correct();
            },
            //#test6
            // продолжение 5 теста
            /*
            *тест таймера:
            *   - клик на 0 клетку => время пошло
            *     случай когда с 1 клика на бомбу => время стоит =>
            *   проверим есть ли картинка + => перезагрузить страницу и ещё раз
            *
            * */
            async () => {
                let cell = this.getCellByClass("cell", 0);
                let backgroundImage = window.getComputedStyle(cell).backgroundImage;
                if (backgroundImage !== 'none' ||
                    cell.children.length > 0 && cell.children[0].tagName.toLowerCase() === 'img'
                ) {
                    return hs.wrong("reloadPage")
                }

                return new Promise((resolve) => {
                    window.setTimeout(() => {
                        if (this.elements.clock.innerText === "0:00") {
                            resolve(hs.wrong("The timer didn't launch when the first click was commited."))
                        }

                        resolve(hs.correct())
                    }, 3000)
                })
            },
            //#test7
            // продолжение 5 теста
            /*
            *   - нажимать на все клетки, пока время не остановится (нашли бомбу)
            *     Если время не остановилось => или таймер не правильный
            *     или бомб не было
            * */
            async () => {
                for ( let i = 0; i < 72; i++) {
                    let cell = document.getElementsByClassName("cell")[i];
                    let timerBefore = this.elements.clock.innerText;
                    cell.click();
                    await setTimeout(() => {}, 300);
                    if (cell.children.length > 0 && cell.children[0].tagName.toLowerCase() === 'img' ||
                        window.getComputedStyle(cell).backgroundImage !== "none"
                    ) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                if (this.elements.clock.innerText !== timerBefore) {
                                    resolve(hs.wrong("The timer should stop when you click on the cell with mine."))
                                }
                                resolve(hs.correct())
                            }, 1000)
                        })
                    }
                }

                return hs.wrong("There should be 10 mines on the field, but there is not so many.");
            },
            //#test8
            /* тест на то как открываются области
                идём по всем клеткам, делаем проверку, если клетка открытая
                 (клик по ней правой кнопкой ничего не меняет),то  дальше проверяем:

                - если клетка пустая, то вокруг неё все клетки открытые или с цифрами

                - если клетка с цифрой, рядом с ней найдётся хотя бы одна закрытая

                - если клетка с бомбой, то вокруг неё только клетки с цифрами >= 1 или закрытые
                * */
            async () => {
                let getCellByClass = this.getCellByClass;
                let isCellWithPicture = this.isCellWithPicture;
                let cell = document.getElementsByClassName("cell")[0];
                let border = window.getComputedStyle(cell).border;
                let outline = window.getComputedStyle(cell).outline;
                let backgroundColor = window.getComputedStyle(cell).backgroundColor;

                function isClosedCell (cell) {
                    let cellBorder = window.getComputedStyle(cell).border;
                    let cellOutline = window.getComputedStyle(cell).outline;
                    let cellBackgroundCol = window.getComputedStyle(cell).backgroundColor;
                    if (outline !== cellOutline || border !== cellBorder || backgroundColor !== cellBackgroundCol) return true;

                    return false
                }

                function isOk (i, row, col) {
                    return !(row === 0 && col === 0) &&
                        i + row * 8 + col >= 0 &&
                        i % 8 + col >= 0 && Math.floor(i / 8) + row >= 0 &&
                        i % 8 + col < 8 && Math.floor(i / 8) + row < 9
                }

                async function checkCell(i) {
                    let cell = getCellByClass("cell", i);

                    if (!isCellWithPicture(cell)) {
                        if (isClosedCell(cell)){

                            return true
                        } else {
                            if (cell.innerText !== '') {
                                //with number
                                for (let row = -1; row <= 1; row++) {
                                    for (let col = -1; col <= 1; col++) {
                                        if (isOk(i,row,col)) {
                                            let checkCell = getCellByClass("cell",i + row * 8 + col)
                                            if ( isClosedCell(checkCell) || isCellWithPicture(checkCell)) {
                                                return true
                                            }
                                        }
                                    }
                                }
                                return false
                            } else {
                                //opened empty
                                for (let row = -1; row <= 1; row++) {
                                    for (let col = -1; col <= 1; col++) {
                                        if (isOk(i,row,col)) {
                                            //console.log(i + row * 8 + col)
                                            let checkCell = getCellByClass("cell",i + row * 8 + col)
                                            if (isClosedCell(checkCell) || isCellWithPicture(checkCell)) return false
                                        }
                                    }
                                }
                                return true
                            }
                        }
                    } else {
                        for (let row = -1; row <= 1; row++) {
                            for (let col = -1; col <= 1; col++) {
                                //console.log(i + row * 8 + col)
                                if (isOk(i,row,col)) {
                                    let checkCell = getCellByClass("cell",i + row * 8 + col)
                                    if (!isClosedCell(checkCell) && !checkCell.innerText) return false
                                }
                            }
                        }
                        return true
                    }
                }

                for (let i=0; i<72; i++) {
                    let res = await checkCell(i);
                    if (!res) return hs.wrong("If you clicked on a cell with n mines around it, it should show n.\n" +
                        "If you clicked on a cell with no bombs around it, it should open an area.")
                }

                return hs.correct()
            }
        );

        if ( resultFirstPrt['type'] === 'correct' || resultFirstPrt['type'] === 'wrong' && !resultFirstPrt['message'].includes("reloadPage")) {
            result = resultFirstPrt;
            break;
        } else {
            page.close()
        }

    }

    await sleep(15000);
    await browser.close();
    return result


}

jest.setTimeout(60000);
test("Test stage", async () => {
    let result = await react.startServerAndTest(
        'localhost', 3010, path.resolve(__dirname, '..'), stageTest
    );

    if (result['type'] === 'wrong') {
        fail(result['message']);
    }
});

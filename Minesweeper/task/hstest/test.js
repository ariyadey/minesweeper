const puppeteer = require('puppeteer');
const path = require('path');
// '..' since we're in the hstest/ subdirectory; learner is supposed to have src3/index.html
// const pagePath = 'file://' + path.resolve(__dirname, '../src3/index.html');

const hs = require('hs-test-web');
const react = require("hs-test-web-server");

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function stageTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args:['--start-maximized', '--disable-infobar'],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3010');

    //await sleep(1000000);
    page.on('console', msg => console.log(msg.text()));

    let result = await hs.testPage(page,
        () => {
            if (document.getElementById('root').textContent === "Minesweeper is loading...") {
                return hs.correct();
            } else {
                return hs.wrong("There should be a text 'Minesweeper is loading...' ");
            }
        },
        () => {
            let result = hs.wrong("The font should be changed.");

            Array.from(document.getElementsByTagName("*")).forEach( element => {
                if (element.tagName !== "HTML" && element.innerText === 'Minesweeper is loading...') {
                    // console.log(element.tagName," ",window.getComputedStyle(element).fontFamily)
                    if (window.getComputedStyle(element).fontFamily !== "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif") {
                        result = hs.correct()
                    }
                }
            });

            return result;
        },
        () => {
            let imgs = document.getElementsByTagName('img');
            if (imgs.length !== 1) {
                return hs.wrong("Only one picture should be on the page")
            }

            try {
                let canvas = document.createElement('canvas');
                canvas.width = imgs[0].width;
                canvas.height = imgs[0].height;
                canvas.getContext('2d').drawImage(imgs[0], 0,0,imgs[0].width, imgs[0].height)
                let pixelColor = canvas.getContext('2d').getImageData(imgs[0].width/2,imgs[0].height/2, 1, 1).data
                let logoPixelColor = [97,218,251];
                if (logoPixelColor[0] === pixelColor[0] &&
                    logoPixelColor[1] === pixelColor[1] &&
                    logoPixelColor[2] === pixelColor[2]) {

                    return hs.wrong("There shouldn't be the React logo on the page");
                }
            }
            catch (e) {
                return hs.correct();
            }

            return hs.correct();
        },
        () => {
            let result = hs.wrong();

            Array.from(document.getElementsByTagName("*")).forEach( element => {
                if ( element.children.length === 2 && element.innerText === "Minesweeper is loading...") {
                    let style = window.getComputedStyle(element);
                    if (style.display === "flex" &&
                        style.flexDirection === "column" &&
                        style.alignItems === "center" &&
                        style.justifyContent === "center") {
                        result = hs.correct();
                    }
                }
            });

            return result;
        }
    );

    await browser.close();
    return result;


}

jest.setTimeout(30000);
test("Test stage", async () => {
    let result = await react.startServerAndTest(
        'localhost', 3010, path.resolve(__dirname, '..'), stageTest
    );

    if (result['type'] === 'wrong') {
        fail(result['message']);
    }
});


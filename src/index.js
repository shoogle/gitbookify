const title = document.getElementById('title');
const content = document.getElementById('content');
const convertBtn = document.getElementById('convertBtn');
const details = document.getElementById('details');

const xmlTagPattern = /<([A-Za-z0-9]+)/g;
const kbdOpenTagPattern = /(<kbd[^>]*>)+/g;
const kbdCloseTagPattern = /(<\/kbd[^>]*>)+/g;
const allowedHtmlInMarkdown = {
    // Standard HTML
    kbd: ['class'],
    samp: ['class'],
    code: ['language'],
    img: ['src', 'width', 'height', 'alt'],
    br: null,
    pre: null,

    // Syntax highlighting tags
    bash: null,
    cmake: null,
    cpp: null,
    html: null,
    js: null,
    php: null,
    python: null,
    qml: null,
    xml: null,
};

function convert() {
    let filename = title.value;
    let text = content.value;
    const tail = filename.slice(-5).toLowerCase();

    if (tail === '.html') {
        text = convertHtml(text);
    } else if (tail.endsWith('.md')) {
        text = convertMarkdown(text);
    } else if (isMarkdown(text)) {
        filename += '.md';
        text = convertMarkdown(text);
    } else {
        filename += '.html';
        text = convertHtml(text);
    }

    title.value = filename;
    content.value = text;
    saveTextFile(filename, text);
}

function convertMarkdown(text) {
    // Headings (#)
    text = text.replace(/^(#+)#/gm, '$1');

    // Keyboard shortcuts (<kbd>)
    text = text.replace(kbdOpenTagPattern, '`');
    text = text.replace(kbdCloseTagPattern, '`');
    return text;
}

function convertHtml(text) {
    // Headings (<h1>)
    for (let i = 1; i < 6; ++i) {
        text = text.replace(new RegExp(`<(/?)h${i + 1}>`, 'g'), `<$1h${i}>`);
    }

    // Keyboard shortcuts (<kbd>)
    text = text.replace(kbdOpenTagPattern, '<code>');
    text = text.replace(kbdCloseTagPattern, '</code>');
    return text;
}

function isMarkdown(str) {
    for (const match of str.matchAll(xmlTagPattern)) {
        // TODO: Ignore tags within <html> and <xml> syntax highlighted blocks.
        if (!(match[1] in allowedHtmlInMarkdown)) {
            return false;
        }
        // TODO: Check attributes are allowed.
    }
    return true;
}

function saveTextFile(filename, text) {
    const dummyLink = document.createElement('a');
    dummyLink.style.display = 'none';
    dummyLink.setAttribute('download', filename);
    dummyLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    document.body.appendChild(dummyLink);
    dummyLink.click();
    dummyLink.remove();
}

function enableConvertBtn() {
    convertBtn.disabled = title.value.length === 0 || content.value.length === 0;
}

function removeNewlines(field) {
    field.value = field.value.replace(/\n/g, '');
}

function adjustContentHeight() {
    content.style.height = `calc(100vh - ${content.getBoundingClientRect().top + 15}px)`;
}

adjustContentHeight();
window.addEventListener('resize', adjustContentHeight);
details.addEventListener('toggle', adjustContentHeight);

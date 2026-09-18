let selectedVersion = "v4";
let selectedAmount = 1;
let generatedUUIDs = [];


/* =========================
   GENERATOR
========================= */

const output = document.getElementById("output");
const generateButton = document.getElementById("generateButton");
const resultCount = document.getElementById("resultCount");
const versionButtons = document.querySelectorAll(".version-button");
const amountButtons = document.querySelectorAll(".amount-button");

const activeVersionButton =
    document.querySelector(".version-button.active");

if (activeVersionButton) {
    selectedVersion =
        activeVersionButton.dataset.version;
}

const amountInput = document.getElementById("amountInput");
const formatSelect = document.getElementById("format");
const sqlOptions = document.getElementById("sqlOptions");
const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");


function generateUUIDv4() {

    return crypto.randomUUID();

}


function generateUUIDv7() {

    const timestamp = Date.now();

    const bytes = new Uint8Array(16);

    crypto.getRandomValues(bytes);


    bytes[0] = (timestamp / 2 ** 40) & 0xff;
    bytes[1] = (timestamp / 2 ** 32) & 0xff;
    bytes[2] = (timestamp / 2 ** 24) & 0xff;
    bytes[3] = (timestamp / 2 ** 16) & 0xff;
    bytes[4] = (timestamp / 2 ** 8) & 0xff;
    bytes[5] = timestamp & 0xff;


    bytes[6] = (bytes[6] & 0x0f) | 0x70;

    bytes[8] = (bytes[8] & 0x3f) | 0x80;


    const hex = Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");


    return (
        hex.slice(0, 8) +
        "-" +
        hex.slice(8, 12) +
        "-" +
        hex.slice(12, 16) +
        "-" +
        hex.slice(16, 20) +
        "-" +
        hex.slice(20)
    );

}


function formatUUID(uuid) {

    let result = uuid;


    const uppercase =
        document.getElementById("uppercase");


    const braces =
        document.getElementById("braces");


    const noHyphens =
        document.getElementById("noHyphens");


    const quotes =
        document.getElementById("quotes");


    if (uppercase && uppercase.checked) {
        result = result.toUpperCase();
    }


    if (noHyphens && noHyphens.checked) {
        result = result.replace(/-/g, "");
    }


    if (braces && braces.checked) {
        result = `{${result}}`;
    }


    if (quotes && quotes.checked) {
        result = `"${result}"`;
    }


    return result;

}


function formatOutput(uuids) {

    if (!formatSelect) {
        return uuids.join("\n");
    }


    const format = formatSelect.value;


    if (format === "plain") {

        return uuids.join("\n");

    }


    if (format === "json") {

        return JSON.stringify(uuids, null, 2);

    }


    if (format === "csv") {

        return "uuid\n" + uuids.join("\n");

    }


    if (format === "sql") {

        const tableName =
            document.getElementById("tableName").value.trim()
            || "uuids";


        const columnName =
            document.getElementById("columnName").value.trim()
            || "uuid";


        return uuids
            .map(uuid =>
                `INSERT INTO ${tableName} (${columnName}) VALUES ('${uuid}');`
            )
            .join("\n");

    }

}


function refreshOutput() {

    if (!output) {
        return;
    }


    const formattedUUIDs =
        generatedUUIDs.map(formatUUID);


    output.value =
        formatOutput(formattedUUIDs);

}


if (versionButtons.length > 0) {

    versionButtons.forEach(button => {

        button.addEventListener("click", () => {

            versionButtons.forEach(btn =>
                btn.classList.remove("active")
            );


            button.classList.add("active");


            selectedVersion =
                button.dataset.version;

        });

    });

}


if (amountButtons.length > 0) {

    amountButtons.forEach(button => {

        button.addEventListener("click", () => {

            amountButtons.forEach(btn =>
                btn.classList.remove("active")
            );


            button.classList.add("active");


            selectedAmount =
                Number(button.dataset.amount);


            if (amountInput) {
                amountInput.value =
                    selectedAmount;
            }

        });

    });

}


if (amountInput) {

    amountInput.addEventListener("input", () => {

        let value =
            Number(amountInput.value);


        if (value < 1) {
            value = 1;
        }


        if (value > 10000) {
            value = 10000;
        }


        selectedAmount = value;

    });

}


if (generateButton) {

    generateButton.addEventListener("click", () => {

        generatedUUIDs = [];


        for (
            let i = 0;
            i < selectedAmount;
            i++
        ) {

            let uuid;


            if (selectedVersion === "v7") {
                uuid = generateUUIDv7();
            } else {
                uuid = generateUUIDv4();
            }


            generatedUUIDs.push(uuid);

        }


        refreshOutput();


        if (resultCount) {

            resultCount.textContent =
                `${generatedUUIDs.length} UUIDs`;

        }

    });

}


if (formatSelect) {

    formatSelect.addEventListener("change", () => {

        if (sqlOptions) {

            if (formatSelect.value === "sql") {
                sqlOptions.classList.add("visible");
            } else {
                sqlOptions.classList.remove("visible");
            }

        }


        refreshOutput();

    });

}


[
    "uppercase",
    "braces",
    "noHyphens",
    "quotes"
].forEach(id => {

    const checkbox =
        document.getElementById(id);


    if (checkbox) {

        checkbox.addEventListener(
            "change",
            refreshOutput
        );

    }

});


[
    "tableName",
    "columnName"
].forEach(id => {

    const input =
        document.getElementById(id);


    if (input) {

        input.addEventListener(
            "input",
            refreshOutput
        );

    }

});


if (copyButton) {

    copyButton.addEventListener("click", async () => {

        if (!output || !output.value) {
            return;
        }


        await navigator.clipboard.writeText(
            output.value
        );


        const originalText =
            copyButton.textContent;


        copyButton.textContent =
            "Copied!";


        setTimeout(() => {

            copyButton.textContent =
                originalText;

        }, 1500);

    });

}


if (downloadButton) {

    downloadButton.addEventListener("click", () => {

        if (!output || !output.value) {
            return;
        }


        const blob =
            new Blob(
                [output.value],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        let extension = "txt";


        if (
            formatSelect &&
            formatSelect.value === "json"
        ) {

            extension = "json";

        } else if (
            formatSelect &&
            formatSelect.value === "csv"
        ) {

            extension = "csv";

        } else if (
            formatSelect &&
            formatSelect.value === "sql"
        ) {

            extension = "sql";

        }


        link.download =
            `uuid-${selectedVersion}.${extension}`;


        link.click();


        URL.revokeObjectURL(url);

    });

}


/* =========================
   THEME
========================= */

const themeButton =
    document.getElementById("themeButton");

document.body.classList.add("dark");

if (themeButton) {

    themeButton.textContent = "☀️";

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (
            document.body.classList.contains("dark")
        ) {
            themeButton.textContent = "☀️";
        } else {
            themeButton.textContent = "🌙";
        }

    });

}


/* =========================
   TOOL TABS
========================= */

const toolTabs =
    document.querySelectorAll(".tool-tab");


const generatorTool =
    document.getElementById("generatorTool");


const validatorTool =
    document.getElementById("validatorTool");


const decoderTool =
    document.getElementById("decoderTool");


if (toolTabs.length > 0) {

    toolTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            toolTabs.forEach(t =>
                t.classList.remove("active")
            );


            tab.classList.add("active");


            if (generatorTool) {
                generatorTool.style.display = "none";
            }


            if (validatorTool) {
                validatorTool.style.display = "none";
            }


            if (decoderTool) {
                decoderTool.style.display = "none";
            }


            if (tab.dataset.tool === "generator") {

                if (generatorTool) {
                    generatorTool.style.display =
                        "block";
                }

            }


            if (tab.dataset.tool === "validator") {

                if (validatorTool) {
                    validatorTool.style.display =
                        "block";
                }

            }


            if (tab.dataset.tool === "decoder") {

                if (decoderTool) {
                    decoderTool.style.display =
                        "block";
                }

            }

        });

    });

}


/* =========================
   VALIDATOR
========================= */

const validatorInput =
    document.getElementById("validatorInput");


const validateButton =
    document.getElementById("validateButton");


const validationResults =
    document.getElementById("validationResults");


function validateUUID(uuid) {

    const cleanUUID =
        uuid
            .trim()
            .replace(/[{}"]/g, "");


    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    return uuidRegex.test(cleanUUID);

}


if (validateButton) {

    validateButton.addEventListener("click", () => {

        const lines =
            validatorInput.value
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);


        validationResults.innerHTML = "";


        if (lines.length === 0) {

            validationResults.textContent =
                "Please enter at least one UUID.";

            return;

        }


        lines.forEach(uuid => {

            const item =
                document.createElement("div");


            item.classList.add(
                "validation-item"
            );


            if (validateUUID(uuid)) {

                item.classList.add("valid");


                item.textContent =
                    `✓ Valid UUID — ${uuid}`;

            } else {

                item.classList.add("invalid");


                item.textContent =
                    `✗ Invalid UUID — ${uuid}`;

            }


            validationResults.appendChild(item);

        });

    });

}


/* =========================
   DECODER
========================= */

const decoderInput =
    document.getElementById("decoderInput");


const decodeButton =
    document.getElementById("decodeButton");


const decoderResults =
    document.getElementById("decoderResults");


function decodeUUID(uuid) {

    const cleanUUID =
        uuid
            .trim()
            .replace(/[{}"]/g, "");


    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


    if (!uuidRegex.test(cleanUUID)) {
        return null;
    }


    const parts =
        cleanUUID.split("-");


    const version =
        parseInt(
            parts[2][0],
            16
        );


    const variantHex =
        parseInt(
            parts[3][0],
            16
        );


    let variant;


    if ((variantHex & 0x8) === 0) {

        variant = "NCS";

    } else if (
        (variantHex & 0xC) === 0x8
    ) {

        variant =
            "RFC 4122 / RFC 9562";

    } else if (
        (variantHex & 0xE) === 0xC
    ) {

        variant = "Microsoft";

    } else {

        variant = "Future";

    }


    const rawHex =
        parts.join("");


    let timestamp = null;


    if (version === 7) {

        const timestampHex =
            parts[0] + parts[1];


        const timestampMilliseconds =
            parseInt(
                timestampHex,
                16
            );


        if (
            !isNaN(
                timestampMilliseconds
            )
        ) {

            timestamp =
                new Date(
                    timestampMilliseconds
                ).toISOString();

        }

    }


    return {

        version,

        variant,

        timestamp,

        rawHex,

        fields: {

            time_low: parts[0],

            time_mid: parts[1],

            time_high_and_version:
                parts[2],

            clock_seq_and_variant:
                parts[3],

            node: parts[4]

        }

    };

}


function addDecoderRow(
    label,
    value
) {

    const row =
        document.createElement("div");


    row.classList.add(
        "decoder-item"
    );


    const labelElement =
        document.createElement("span");


    labelElement.classList.add(
        "decoder-label"
    );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement("span");


    valueElement.classList.add(
        "decoder-value"
    );


    valueElement.textContent =
        value;


    row.appendChild(labelElement);

    row.appendChild(valueElement);


    decoderResults.appendChild(row);

}


if (decodeButton) {

    decodeButton.addEventListener("click", () => {

        decoderResults.innerHTML = "";


        const uuid =
            decoderInput.value.trim();


        if (!uuid) {

            decoderResults.textContent =
                "Please enter a UUID.";

            return;

        }


        const decoded =
            decodeUUID(uuid);


        if (!decoded) {

            const error =
                document.createElement("div");


            error.classList.add(
                "decoder-error"
            );


            error.textContent =
                "Invalid UUID format.";


            decoderResults.appendChild(
                error
            );


            return;

        }


        addDecoderRow(
            "Version",
            `UUID v${decoded.version}`
        );


        addDecoderRow(
            "Variant",
            decoded.variant
        );


        addDecoderRow(
            "Raw hexadecimal",
            decoded.rawHex
        );


        if (decoded.timestamp) {

            addDecoderRow(
                "Timestamp",
                decoded.timestamp
            );

        }


        addDecoderRow(
            "Time low",
            decoded.fields.time_low
        );


        addDecoderRow(
            "Time mid",
            decoded.fields.time_mid
        );


        addDecoderRow(
            "Time high & version",
            decoded.fields.time_high_and_version
        );


        addDecoderRow(
            "Clock sequence & variant",
            decoded.fields.clock_seq_and_variant
        );


        addDecoderRow(
            "Node",
            decoded.fields.node
        );

    });

}
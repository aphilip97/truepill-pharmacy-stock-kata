export const printFormulary = (
    form: Formulary,
    showHeading = true,
) => {

    const heading = 'Formulary';
    let col_width = heading.length;
    const padding = 2;

    if (form)

    // Set column width to length of longest name
    for (let i = 0; i < form.length; i++) {

        const med = form[i];
        if (!med) continue;

        if (med.length > col_width) {
            col_width = med.length;
        }

    }

    // Pad column
    col_width += padding;

    const line = `+${'-'.repeat(col_width)}+`;
    const emptyRow = `| ${
        '(empty)'.padEnd(col_width - padding)
    } |`;

    const content = form.map((med) => {
        return `| ${med.padEnd(col_width - padding)} |`;
    });

    console.log(
        `${
            showHeading ? `\n${line}\n${
                `| ${heading.padEnd(col_width - padding)} |`
            }` : ''
        }${
            `\n${
                line
            }\n${
                content.length > 0
                ? content.join('\n')
                : emptyRow
            }\n${
                line
            }\n`
        }`,
    );

};

export const printInventory = (inv: Inventory) => {

    // index column width temp
    const col1Heading = 'Name';
    const col2Heading = 'Strength (mg)';
    const col3Heading = 'Pack Size';
    const col4Heading = 'Total Packs';

    const padding = 2;

    let col1 = col1Heading.length;
    let col2 = col2Heading.length;
    let col3 = col3Heading.length;
    let col4 = col4Heading.length;

    for (let i = 0; i < inv.length; i++) {

        const item = inv[i];

        if (!item) continue;

        const nameLength = item.name.length;
        if (nameLength > col1) col1 = nameLength;

        const strLength = String(item.strength).length;
        if (strLength > col2) col2 = strLength;

        const sizeLength = String(item.pack_size).length;
        if (sizeLength > col3) col3 = sizeLength;

        const totPackLength = String(item.total_packs).length;
        if (totPackLength > col4) col4 = totPackLength;

    }

    const empty = '(empty)';

    if (empty.length > col1) col1 = empty.length;
    if (empty.length > col2) col2 = empty.length;
    if (empty.length > col3) col3 = empty.length;
    if (empty.length > col4) col4 = empty.length;

    const emptyRow = `| ${
        empty.padEnd(col1)
    } | ${
        empty.padStart(col2)
    } | ${
        empty.padStart(col3)
    } | ${
        empty.padStart(col4)
    } |`;

    // Repeat alias
    const r = (num: number, str = '-') => str.repeat(num);

    // Column widths with one space padding on each side.
    const _1 = col1 + padding;
    const _2 = col2 + padding;
    const _3 = col3 + padding;
    const _4 = col4 + padding;

    const line = `+${r(_1)}+${r(_2)}+${r(_3)}+${r(_4)}+`;

    const content = inv.map((med) => {

        const name   = String(med.name);
        const str    = String(med.strength);
        const pk_sz  = String(med.pack_size);
        const tot_pk = String(med.total_packs);

        return `| ${
            name.padEnd(col1)
        } | ${
            str.padStart(col2)
        } | ${
            pk_sz.padStart(col3)
        } | ${
            tot_pk.padStart(col4)
        } |`;

    });

    console.log(
        `\n${
            // Top line
            line
        }\n${
            // Column headers
            `| ${
                col1Heading.padEnd(col1)
            } | ${
                col2Heading.padStart(col2)
            } | ${
                col3Heading.padStart(col3)
            } | ${
                col4Heading.padStart(col4)
            } |`
        }\n${
            // Separator
            line
        }\n${
            content.length > 0
            ? content.join('\n')
            : emptyRow
        }\n${
            line
        }\n`
    );

};
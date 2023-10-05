function generateHTML(
  boardName,
  columns,
  groups,
  groupwise_items,
  statusColumns
) {
  const boardHtml = `<h1>${boardName}</h1>`;

  const columnsHtml = columns.map(({ title }) => `<th>${title}</th>`);
  const subitemsColumnsHtml = columns.map(({ title, type }) => {
    if (type === "subtasks") return "";
    else return `<th>${title}</th>`;
  });

  const groupsHtml = groups.map((groupName) => {
    return `<h2>${groupName}</h2>`;
  });

  const itemsHtml = groupwise_items.map((group) => {
    return group.map(({ name, columnValues, subitems }) => {
      return `<tr><td>${name}</td>${columnValues
        .map(({ text, type, id }) => {
          if (type === "color") {
            const statusColumn = statusColumns.find(
              (statusColumn) => statusColumn.id === id
            );

            const labelIndex = statusColumn.labels.indexOf(text);
            const labelColorBackground =
              statusColumn.labelColors[labelIndex]?.color || "#797E93";
            const labelColorBorder =
              statusColumn.labelColors[labelIndex]?.border || "#797E93";

            return `<td style="background-color: ${labelColorBackground}; border: 1px solid ${labelColorBorder};">${text}</td>`;
          }
          return `<td>${text}</td>`;
        })
        .join("")}</tr>${
        subitems.subitemsName.length > 0
          ? `<tr><th style="background-color: white; opacity: 0.5">Subitems</th>${subitemsColumnsHtml.join(
              ""
            )}</tr>${subitems.subitemsName
              .map((name, i) => {
                return `<tr><td></td><td>${name}</td>${subitems.subitemsColumnValues[
                  i
                ]
                  .map(({ text, type, id }) => {
                    if (type === "color") {
                      const statusColumn = statusColumns.find(
                        (statusColumn) => statusColumn.id === id
                      );

                      const labelIndex = statusColumn.labels.indexOf(text);
                      const labelColorBackground =
                        statusColumn.labelColors[labelIndex]?.color ||
                        "#797E93";
                      const labelColorBorder =
                        statusColumn.labelColors[labelIndex]?.border ||
                        "#797E93";

                      return `<td style="background-color: ${labelColorBackground}; border: 1px solid ${labelColorBorder};">${
                        text ? text : ""
                      }</td>`;
                    }
                    return `<td>${text}</td>`;
                  })
                  .join("")}</tr>`;
              })
              .join("")}`
          : ""
      }`;
    });
  });

  const html = `
        <html>
          <head>
            <style>
            * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
    
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px;
          }
          h1,
          h2 {
            text-align: left;
            margin: 10px 0px 10px 0px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid black;
            text-align: center;
            padding-top: 5px;
            padding-bottom: 5px;
          }
          th {
            background-color: #f2f2f2;
            /*                    padding: .5rem;*/
            font-weight: bold;
            color: black;
          }
          </style>
          </head>
    
          <body>
            ${boardHtml}
            ${groupsHtml
              .map((group, i) => {
                return `${group}
                <table>
                  <tr>
                    ${columnsHtml.join("")}
                  </tr>
                  ${itemsHtml[i]
                    .map((item) => {
                      return `${item}`;
                    })
                    .join("")}
                </table>`;
              })
              .join("")}
          </body>
        </html>
      `;
  return html;
}

module.exports = { generateHTML };

const monday = require("monday-sdk-js")();

async function getRequiredData(context, includeSubitems, includeUpdates) {
  monday.setToken(
    "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4MTk4Mjg4NywiYWFpIjoxMSwidWlkIjo0ODU5NTMzMiwiaWFkIjoiMjAyMy0wOS0xNFQyMTo0MDo0MS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg3MTUzNzYsInJnbiI6ImV1YzEifQ.pmVheIJ_ordb6DX7Zzj3_5ztoe7tWM3dMax0nmo-DTM"
  );
  let data = JSON.stringify(
    await monday.api(
      `query {
          complexity {
            query
            reset_in_x_seconds
            after
          }
            boards (ids: [${context.boardId}]) {
              name
              columns {
                type
                title
                id
                settings_str
              }
             
                groups(ids: ["new_group", "${context.groupId}"]) {
                title
                  items {
                    id
                    name
                    column_values {
                      value
                      type
                      id
                      text
                    }
                  
                }
              }
            }
          }`
    ),
    { apiVersion: "2023-07" }
  );
  console.log(data);

  data = JSON.parse(data);
  data = data.data;
  console.dir(data, { depth: null });

  if (includeSubitems) {
    const query = JSON.stringify(
      await monday.api(
        `query {
            complexity {
              query
              reset_in_x_seconds
              after
            }
            items (ids: [${data.boards
              .map((board) => {
                return board.groups
                  .map((group) => {
                    return group.items.map((item) => item.id).join(",");
                  })
                  .join(",");
              })
              .join(",")}]) {
                subitems {
                  id
                  name
                  parent_item {
                    id
                  }
                  column_values {
                    value
                    type
                    id
                    text
                  }
                }
            }
          }`,
        { apiVersion: "2023-10" }
      )
    );

    const subitems = JSON.parse(query);
    let filteredSubitems = subitems.data.items.filter(
      (item) => item.subitems !== null
    );
    filteredSubitems = filteredSubitems
      .map((item) => {
        return item.subitems.map((subitem) => {
          return {
            id: subitem.id,
            name: subitem.name,
            parent_item_id: subitem.parent_item.id,
            column_values: subitem.column_values,
          };
        });
      })
      .flat();

    // console.dir(filteredSubitems, { depth: null });
    data.boards.forEach((board) => {
      board.groups.forEach((group) => {
        group.items.forEach((item) => {
          const subItemData = filteredSubitems.filter(
            (subitem) => subitem.parent_item_id === item.id
          );

          if (subItemData.length > 0) {
            item.subitemsName = subItemData.map((subitem) => subitem.name);
            item.subitemColumnValues = subItemData.map(
              (subitem) => subitem.column_values
            );
          } else {
            item.subitemsName = [];
            item.subitemColumnValues = [];
          }
        });
      });
    });
  }

  //Columns -- [{type, title, id, settings_str}]
  const columns = data.boards[0].columns;

  //Groups -- ['Group 1 name', 'Group 2 name']
  const groups = data.boards[0].groups.map((group) => group.title);

  //Items -- [[{id: 'item1-id(g1)', name: 'item1-name(g1)'}], [{id: item1-id (g2), name: item1-name(g2)}]]
  const items = data.boards[0].groups.map((group) => {
    return group.items.map((item) => {
      return {
        id: item.id,
        name: item.name,
        subitems: {
          subitemsName: item.subitemsName || [],
          subitemsColumnValues: item.subitemColumnValues || [],
        },
        columnValues: item.column_values.map((col_val) => {
          return {
            id: col_val.id,
            text: col_val.text,
            value: col_val.value,
            type: col_val.type,
          };
        }),
      };
    });
  });

  const statusColumns = getStatusColumnsData(columns);

  // console.log("-----Columns------------");
  // console.dir(columns, { depth: null });
  // console.log("-----Groups-------------");
  // console.dir(groups, { depth: null });
  // console.log("-----Items--------------");
  // console.dir(items, { depth: null });
  // console.log("-----Column Values------");
  // console.dir(column_values, { depth: null });

  return {
    boardName: data.boards[0].name,
    columns,
    groups,
    items,
    statusColumns,
  };
}

function getStatusColumnsData(columns) {
  const statusColumns = [];
  columns.forEach((column) => {
    if (column.type === "color") {
      const settings_str = JSON.parse(column.settings_str);
      const labels = Object.values(settings_str.labels);
      const labelColors = Object.values(settings_str.labels_colors);
      const statusColumn = {
        id: column.id,
        labels,
        labelColors,
      };
      statusColumns.push(statusColumn);
    }
  });
  return statusColumns;
}

module.exports = { getRequiredData };

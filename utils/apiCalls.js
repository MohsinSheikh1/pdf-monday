const monday = require("monday-sdk-js")();

async function getRequiredData(context, includeSubitems, includeUpdates) {
  monday.setToken(
    "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4NzUzNjUwMiwiYWFpIjoxMSwidWlkIjo0ODU5NTMzMiwiaWFkIjoiMjAyMy0xMC0wOVQyMTo0Njo0NC42NjlaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg3MTUzNzYsInJnbiI6ImV1YzEifQ.i3gyroHelPl8KhNiidIgvNeUA1FbX7nWtnBa_k7fcJk"
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
             
                groups(ids: ["${context.groupId}"]) {
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

  data = JSON.parse(data);
  data = data.data;

  if (includeSubitems) {
    const item_ids = data.boards
      .map((board) => {
        return board.groups
          .map((group) => {
            return group.items.map((item) => item.id);
          })
          .flat();
      })
      .flat();

    let filteredSubitems = [];

    for (let i = 1; i <= Math.ceil(item_ids.length / 100); i++) {
      const query = JSON.stringify(
        await monday.api(
          `query {
            complexity {
              query
              reset_in_x_seconds
              after
            }
            items (limit: 100, ids: [${item_ids
              .slice((i - 1) * 100, i * 100)
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
          { apiVersion: "2023-7" }
        )
      );
      const queryData = JSON.parse(query);
      let filterItems = queryData.data.items.filter((item) => item.subitems);
      filterItems.forEach((item) => filteredSubitems.push(item));
    }

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

    if (includeUpdates) {
    }
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

function getUpdates(itemIds) {}

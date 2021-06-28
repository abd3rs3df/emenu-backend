require("dotenv").config();
const express = require("express");
const Mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static("public"));
//Mysql
const pool = Mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});
//get food for page home
app.get("/get_food", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT food.name_food,food.price,food.description,food.path_image,food.id_type_of_food ,food.id_food,
       type_of_food.name_type_of_food FROM food INNER JOIN type_of_food on food.id_type_of_food = type_of_food.id_type_of_food

      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(JSON.stringify(rows, null, "  "));
        } else {
          console.log(err);
        }
      }
    );
  });
});

//get id of type of food
app.get("/get_idType", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT type_of_food.id_type_of_food as id , type_of_food.name_type_of_food as name FROM type_of_food 
      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(JSON.stringify(rows, null, "  "));
        } else {
          console.log(err);
        }
      }
    );
  });
});
//add order for page order
app.post("/add_order", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    const parms = req.body;
    console.log(`connected as id ${connection.threadId}`);
    connection.query(`INSERT into orders_items (order_id,food_id,quantity)
   VALUES (${parms.order_id},${parms.food_id},${parms.quantity});`);
    connection.query(
      `INSERT INTO orders
    ( id_table, Done) VALUES ( ${parms.id_table}, ${parms.Done});
   `,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send("1");
        } else {
          res.send(err);
        }
      }
    );
  });
});
//get order for page order
app.get("/get_order/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT orders_items.quantity , food.name_food,food.price
      ,orders_items.id from orders_items  
      INNER JOIN food on orders_items.food_id = food.id_food 
      INNER JOIN orders on orders_items.order_id = orders.id_order 
      INNER JOIN tables on orders.id_table = tables.id_table
      WHERE orders.id_table =${req.params.id} and tables.Done = 0
      
      
      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});
//get in dashbord
app.get("/get_dashbord", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT * FROM orders_items INNER JOIN food on 
      orders_items.food_id =food.id_food INNER JOIN orders 
      on orders_items.order_id = orders.id_order inner JOIN tables on orders.id_table = tables.id_table
      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//get number of table is work
app.get("/get_dashbord/get_table", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT order_id , orders.id_table ,
       tables.nuberOfTable FROM orders_items INNER
        JOIN orders on orders_items.order_id
         = orders.id_order INNER JOIN tables on
          orders.id_table = tables.id_table 
          WHERE tables.Done = 0  GROUP BY tables.id_table
      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

///get_dashbord/get_table
app.get("/get_dashbord/get_table/get_orders/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT * FROM orders_items INNER JOIN food on 
      orders_items.food_id =food.id_food INNER JOIN orders 
      on orders_items.order_id = orders.id_order inner JOIN tables on orders.id_table = tables.id_table
     WHERE orders.id_table = ${req.params.id}
      `,
      req.params.id,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

app.get("/get_dashbord/get_table_empty", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `SELECT * FROM tables WHERE Done != 0

      `,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//delet order
app.patch("/get_dashbord/delete_order/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      `UPDATE tables SET Done = '1' WHERE tables.id_table =${req.params.id};
      `,
      (err, rows) => {
        connection.release(); //return the connection to pool

        if (!err) {
          res.send("1");
        } else {
          console.log("0");
        }
      }
    );
  });
});

//listen on enviroment port or 5000
app.listen(port, () => {
  console.log(`llsten to port : ${port}`);
});

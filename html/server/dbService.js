const mysql = require('mysql');
const config = require('./config.json');

let instance = null;

const connection = mysql.createConnection({
    host: config.HOST,
    port: config.DB_PORT,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE,
    supportBigNumbers: true,
    bigNumberStrings: true
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    };
    console.log('DB ' + connection.state);
});

class dbService {
    static getDBServiceInstance() {
        return instance ? instance : new dbService();
    }
    async search(input_value) {
        const columns_to_check = ["ops_orders.so_number",
            "ops_orders.shipping_name",
            "ops_orders.billing_name",
            "ops_orders.billing_postcode",
            "ops_orders.shipping_postcode",
            "ops_serial_numbers.sn"];

        try {
            const response = await new Promise((resolve, reject) => {
                let query = `SELECT ops_orders.so_id, ops_orders.so_number, ops_orders.order_date, ops_orders.dispatch_date, ops_extended_warranty.warranty
                                FROM ops_orders
                                LEFT JOIN ops_serial_numbers on ops_orders.so_id = ops_serial_numbers.order_id
                                LEFT JOIN ops_extended_warranty  on ops_orders.so_id  = ops_extended_warranty .order_id
                                WHERE `
                for (let i = 0; i < columns_to_check.length; i++) {
                    query += `${columns_to_check[i]} like "%${input_value}%" `
                    if (i < columns_to_check.length - 1) {
                        query += " OR "
                    };
                };
                query += ' GROUP by ops_orders.so_id';
                connection.query(query, [input_value], (err, results) => {
                    if (err) reject(new Error(err.message));
                    if (results.length === 0) {
                        get_device_id(input_value, function (data) {
                            resolve(data);
                        });
                    };
                    let results_total = results.length;
                    let res_count = 0;
                    results.forEach(res => {
                        if (res.warranty === null) {
                            res.warranty = 1
                        };

                        res.order_date = res.order_date.toLocaleDateString();

                        let warranty_until_date = new Date(res.dispatch_date);
                        warranty_until_date.setFullYear(warranty_until_date.getFullYear() + 1);
                        res.warranty_until = warranty_until_date.toLocaleDateString();
                        res.dispatch_date = res.dispatch_date.toLocaleDateString();

                        let today = new Date();
                        if (warranty_until_date >= today) {
                            res.in_warranty = "YES"
                        } else {
                            res.in_warranty = "NO"
                        };
                        res.link = create_link(res);

                        get_device_id(input_value, function (data) {
                            if (data.length > 0) {
                                res.id = data[0].id
                                res.model = data[0].model
                                res.organizationid = data[0].organizationid
                                res_count += 1
                                if (res_count === results_total)
                                    resolve(results);
                            } else {
                                resolve(results);
                            };
                        });
                    });
                });
            });

            // console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        };
    };
};

function create_link(result) {
    let order_link = '';
    if (result.so_number.indexOf('LP') > -1) {
        order_link = `https://crm.zoho.com/crm/${config.CRM_ORG_ID}/tab/SalesOrders/${result.so_id}`;
    } else if (result.so_number.indexOf('SO') > -1) {
        order_link = `https://inventory.zoho.com/app#/salesorders/${result.so_id}?filter_by=Status.All&per_page=200&sort_column=last_modified_time&sort_order=D`;
    };
    return order_link;
};

function get_device_id(input, callback) {
    let query = `SELECT id, model, organizationid
                FROM lp_devices             
                WHERE serial="${input}"`;

    connection.query(query, [input], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            callback(result)
        };
    });
};

module.exports = dbService;

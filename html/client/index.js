const config = require('./config.json');

let btn = document.querySelector('#submitButton');

btn.addEventListener('click', function(){
    const searchValue = document.querySelector('#searchText').value;
    if (searchValue.length >= 4) {
        fetch('/search/' + searchValue)
        .then(response => response.json())
        .then(data => LoadHTMLTable(data['data']))
    } else {
        document.querySelector('#results').style.display = 'none'
    };
    
});

function LoadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    document.querySelector('#results').style.display = 'block'
    document.querySelector('#searchText').value = "";
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='not-found' colspan='7'>Not found</td></tr>"; 
        return;
    }
    let tableHtml = "";   

    data.forEach(function ({so_number, order_date, dispatch_date, warranty,warranty_until, in_warranty, link, id, model, organizationid })  {
        let device_link = `${config.DEVICE_LINK}?id=${id}`;
        let org_link = `${config.ORG_LINK}?id=${organizationid}`;

        tableHtml += "<tr>";
        tableHtml += so_number ? `<td style="text-align: left">${so_number}</td>` : "<td></td>";
        tableHtml += order_date ? `<td>${order_date}</td>` : "<td></td>";
        tableHtml += dispatch_date ? `<td>${dispatch_date}</td>` : "<td></td>";
        tableHtml += warranty ? `<td>${warranty}</td>` : "<td></td>";
        tableHtml += warranty_until ? `<td>${warranty_until}</td>` : "<td></td>";
        tableHtml += in_warranty ? `<td>${in_warranty}</td>` : "<td></td>";
        tableHtml += link ? `<td><a href=${link}>Link</td>` : "<td></td>";
        tableHtml += model ? `<td><a href=${device_link}>${model}</td>` : "<td></td>";
        tableHtml += organizationid ? `<td><a href=${org_link}>${organizationid}</td>` : "<td></td>";
        tableHtml += "<tr>";        
    });
    table.innerHTML = tableHtml;
    }

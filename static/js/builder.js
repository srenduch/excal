class Builder {
        constructor() { }

        buildClassSelect(json_data) {
                let html_str = ``;
                json_data.array.forEach(element => {
                        html_str += `<option style="color: black;" data-class-id="${element['id']}">${element['title']}</option>`;
                });
                $('.class-select').html(html_str);
        }
}
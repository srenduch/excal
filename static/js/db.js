export class DBInterface {
    constructor(user_id) {
        this.user_id = user_id
    }

    async userRegister(username, password) {
        const result = await $.ajax({
            url: '/register',
            type: 'POST',
            data: {
                username: username,
                password: password,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async userLogin(username, password) {
        const result = await $.ajax({
            url: '/login',
            type: 'POST',
            data: {
                username: username,
                password: password,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getAssignmentOne(assignment_id) {
        const result = $.ajax({
            url: '/get-assignments',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                assignment_id: assignment_id,
                selector: 'one',
            },
            success: function (data) {
                return data;
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getAssignmentAll() {
        const result = await $.ajax({
            url: '/get-assignments',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                assignment_id: null,
                selector: 'all',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getAssignmentNewest() {
        const result = await $.ajax({
            url: '/get-assignments',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                assignment_id: null,
                selector: 'newest',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getAssignmentForClass(class_id) { }

    async getAssignmentDateRange(start, end) {
        const result = await $.ajax({
            url: '/get-assignments-between-dates',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                start: start,
                end: end,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getClassOne(class_id) {
        const result = await $.ajax({
            url: '/get-classes',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                class_id: class_id,
                selector: 'one',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getClassAll() {
        const result = await $.ajax({
            url: '/get-classes',
            type: 'GET',
            data: {
                user_id: localStorage['user_id'],
                class_id: null,
                selector: 'all',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getClassForAssignment(assignment_id) { }

    async addAssignment() {
        const result = await $.ajax({
            url: '/new-assignment',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                class_id: $('#new-class-select').find(":selected").data('class-id'),
                arguments: arguments,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }
    async addClass() {
        const result = await $.ajax({
            url: 'new-class',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                arguments: arguments,
            },
            success: function (data) {
            },
            error: function (data) {
            }
        })
        return result;
    }

    // async modifyAssignmentOne(assignment_id){}
    // async modifyAssignmentAll(){} -> Can be used to update time_remaining

    async deleteAssignmentOne(assignment_id) {
        const result = await $.ajax({
            url: '/delete-assignment',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                selector: 'one',
                assignment_id: assignment_id,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async deleteAssignmentAll() {
        const result = await $.ajax({
            url: '/delete-assignment',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                class_id: null,
                selector: 'all'
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async deleteClassOne(class_id) {
        const result = await $.ajax({
            url: '/delete-class',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                class_id: class_id,
                selector: 'one'
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async deleteClassAll() {
        const result = await $.ajax({
            url: '/delete-class',
            type: 'POST',
            data: {
                user_id: localStorage['user_id'],
                class_id: null,
                selector: 'all',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async createClassItem(class_id, class_type, start_time, end_time, date, repeat_mode, repeat_days, repeat_end, prof_name, location, description) {
        const result = await $.ajax({
            url: '/new-class-item',
            type: 'POST',
            data: {
                class_id: class_id,
                class_type: class_type,
                start_time: start_time,
                end_time: end_time,
                date: date,
                repeat_mode: repeat_mode,
                repeat_days: repeat_days,
                repeat_end: repeat_end,
                prof_name: prof_name,
                location: location,
                description: description,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getClassItems(class_id) {
        const result = await $.ajax({
            url: '/get-class-items',
            type: 'GET',
            data: {
                class_id: class_id,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async getClassItemsRepeating(class_id) {
        const result = await $.ajax({
            url: '/get-class-items-repeating',
            type: 'GET',
            data: {
                class_id: class_id,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }
    
    async getClassItemsBetweenDates(class_id, start, end) {
        const result = await $.ajax({
            url: '/get-class-items-between-dates',
            type: 'GET',
            data: {
                class_id: class_id,
                start: start,
                end: end,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async deleteClassItemOne(class_item_id) {
        const result = await $.ajax({
            url: '/delete-class-item',
            type: 'POST',
            data: {
                class_id: null,
                class_item_id: class_item_id,
                selector: 'one',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async deleteClassItemAll(class_id) {
        const result = await $.ajax({
            url: '/delete-class-item',
            type: 'POST',
            data: {
                class_id: class_id,
                class_item_id: null,
                selector: 'all',
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }

    async CutRepeatingClassItemAtDate(class_item_id, date) {
        const result = await $.ajax({
            url: '/cut-repeating-class-item-at-date',
            type: 'POST',
            data: {
                class_item_id: class_item_id,
                date: date,
            },
            success: function (data) {
            },
            error: function (data) {
                console.error(data);
            }
        });
        return result;
    }
}
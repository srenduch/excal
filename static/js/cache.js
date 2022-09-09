export class DBCache {
        constructor() {
                this.assignments_cached = false;
                this.classes_cached = false;
        }

        cacheUserData(user_id) {
                localStorage['user_id'] = user_id;
        }

        cacheClasses(class_list) {
                localStorage['classes'] = class_list;
        }
}
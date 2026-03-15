"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassGroupModule = void 0;
const common_1 = require("@nestjs/common");
const class_group_service_1 = require("./class-group.service");
const class_group_controller_1 = require("./class-group.controller");
let ClassGroupModule = class ClassGroupModule {
};
exports.ClassGroupModule = ClassGroupModule;
exports.ClassGroupModule = ClassGroupModule = __decorate([
    (0, common_1.Module)({
        controllers: [class_group_controller_1.ClassGroupController],
        providers: [class_group_service_1.ClassGroupService],
        exports: [class_group_service_1.ClassGroupService],
    })
], ClassGroupModule);
//# sourceMappingURL=class-group.module.js.map
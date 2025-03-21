import { Plugin } from "@elizaos/core";
import { getChongChiDinhThuocAction } from "./actions/getChongChiDinhThuocAction";
import { getDiaChiLienHeAction } from "./actions/getDiaChi";
export const ehisPlugin: Plugin = {
    name: "ehis",
    description: "Ehis's Plugin for Eliza",
    actions: [getChongChiDinhThuocAction,getDiaChiLienHeAction],
    evaluators: [],
    providers: [],
};

export default ehisPlugin;
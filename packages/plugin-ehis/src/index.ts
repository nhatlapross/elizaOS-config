import { Plugin } from "@elizaos/core";
import { getChongChiDinhThuocAction } from "./actions/getChongChiDinhThuocAction";
import { getDiaChiLienHeAction } from "./actions/getDiaChi";
import { apiCallAction } from "./actions/apiCallAction";
import { imageAnalysisAction } from "./actions/imageAnalysisAction"; // Import action mới

export const ehisPlugin: Plugin = {
    name: "ehis",
    description: "Ehis's Plugin for Eliza with API integration and medical image analysis support",
    actions: [
        getChongChiDinhThuocAction,
        getDiaChiLienHeAction,
        apiCallAction,
        imageAnalysisAction // Thêm action phân tích hình ảnh
    ],
    evaluators: [],
    providers: [],
};

export default ehisPlugin;
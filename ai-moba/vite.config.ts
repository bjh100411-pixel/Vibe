import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 프로젝트 저장소 배포 시 상대 경로를 사용합니다.
export default defineConfig({
  plugins: [react()],
  base: "./"
});

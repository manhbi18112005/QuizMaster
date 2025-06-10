
import { createDocument } from "zod-openapi";
import { workspacesPaths } from "./workspaces";

export const document = createDocument({
  openapi: "3.0.3",
  info: {
    title: "Quiz Master API",
    description:
      "Quiz Master is a platform for creating and managing quizzes and assessments.",
    version: "0.0.1",
    contact: {
      name: "No Name Studio Support",
      email: "support@nnsvn.me",
      url: "https://docs.nnsvn.me/quizmaster/api",
    },
    license: {
      name: "GNU General Public License v3.0 license",
      url: "https://github.com/manhbi18112005/quizmaster/blob/main/LICENSE",
    },
  },
  servers: [
    {
      url: "https://quizmaster.nnsvn.me/api",
      description: "Production API",
    },
  ],
  paths: {
    ...workspacesPaths,
  },
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Use your Quizmaster x-api-key to authenticate.",
      },
    },
  },

});
import { useCopilotAction } from "@copilotkit/react-core";
import axios from "axios";
import { toast } from "react-toastify";

export const CopilotActions = () => {
  useCopilotAction({
    name: "addProduct",
    description: "Add a new product to the store",
    parameters: [
      {
        name: "productName",
        type: "string",
        description: "Name of the product",
        required: true,
      },
      {
        name: "skuCode",
        type: "string",
        description: "SKU code of the product",
        required: true,
      },
      {
        name: "manufacturer",
        type: "string",
        description: "Manufacturer of the product",
        required: false,
      },
      {
        name: "categoryName",
        type: "string",
        description: "Category name",
        required: true,
      },
      {
        name: "subCategoryName",
        type: "string",
        description: "Subcategory name",
        required: true,
      },
      {
        name: "brandName",
        type: "string",
        description: "Brand name",
        required: true,
      },
      {
        name: "productDescription",
        type: "string",
        description: "Product description",
        required: false,
      },
      {
        name: "variants",
        type: "array",
        description: "Product variants (e.g., size, color, price)",
        required: true,
      },
      {
        name: "productImages",
        type: "array",
        description: "List of image URLs",
        required: true,
      },
    ],
    handler: async ({
      productName,
      skuCode,
      manufacturer,
      categoryName,
      subCategoryName,
      brandName,
      productDescription,
      variants,
      productImages,
    }) => {
      try {
        const userEmail = localStorage.getItem("userEmail");

        const productData = {
          userEmail,
          productName,
          skuCode,
          manufacturer,
          categoryName,
          subCategoryName,
          brandName,
          productDescription,
          variants,
          productImages,
        };

        const response = await axios.post(
          process.env.REACT_APP_API_URL + "product/add",
          productData
        );

        if (response.status === 201) {
          toast.success("Product added successfully");
        } else {
          toast.error("Failed to add product");
        }
      } catch (error) {
        console.error("Error adding product:", error);
        toast.error("Something went wrong while adding the product.");
      }
    },
  });

  return null; // since this is a logic-only component
};

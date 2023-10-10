/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I can upload a new bill only with jpg, jpeg or png extension", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.NewBill);
      const html = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = html;

      const uploadInput = screen.getByTestId("file");
      const file0 = new File(["hello"], "hello.png", { type: "image/png" });
      const file1 = new File(["hello"], "hello.jpg", { type: "image/jpg" });
      const file2 = new File(["hello"], "hello.jpeg", { type: "image/jpeg" });
      const file3 = new File(["hello"], "hello.txt", { type: "text/plain" });

      const handleChangeFile = jest.fn();

      uploadInput.addEventListener("change", handleChangeFile);

      fireEvent.change(uploadInput, { target: { files: [file0] } });
      expect(uploadInput.files[0].name).toBe("hello.png");
      expect(uploadInput.files[0].type).toBe("image/png");
      expect(handleChangeFile).toHaveBeenCalled();

      fireEvent.change(uploadInput, {
        target: { files: [file1] },
      });
      expect(uploadInput.files[0].name).toBe("hello.jpg");
      expect(uploadInput.files[0].type).toBe("image/jpg");
      expect(handleChangeFile).toHaveBeenCalled();

      fireEvent.change(uploadInput, {
        target: { files: [file2] },
      });
      expect(uploadInput.files[0].name).toBe("hello.jpeg");
      expect(uploadInput.files[0].type).toBe("image/jpeg");
      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("Then I can fill the form and submit a new bill", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.NewBill);
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

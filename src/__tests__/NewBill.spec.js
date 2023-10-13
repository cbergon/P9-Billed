/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore, { errorHandler } from "../__mocks__/store.js";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
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
      document.body.appendChild(root);
      router();
    });

    test("Then I can upload a new bill only with jpg, jpeg or png extension", async () => {
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

    describe("When an error occurs on API", () => {
      const fakeBill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };

      test("Then I see an error if the API returns a 404 error", async () => {
        const mockedError = errorHandler(mockStore.create, "404");
        let response;
        try {
          response = await mockedError(fakeBill);
        } catch (err) {
          response = { error: err };
        }
        document.body.innerHTML = BillsUI(response);
        expect(screen.getByText(/Erreur 404/)).toBeTruthy();
      });

      test("Then I see an error if the API returns a 500 error", async () => {
        const mockedError = errorHandler(mockStore.create, "500");
        let response;
        try {
          response = await mockedError(fakeBill);
        } catch (err) {
          response = { error: err };
        }
        document.body.innerHTML = BillsUI(response);
        expect(screen.getByText(/Erreur 500/)).toBeTruthy();
      });
    });
  });
});

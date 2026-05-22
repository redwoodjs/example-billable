// Mock the rwsdk/client module
jest.mock("rwsdk/client", () => ({
  initClient: jest.fn(),
  initClientNavigation: jest.fn(),
}));

import { initClient, initClientNavigation } from "rwsdk/client";

describe("client.tsx", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Dynamically import the client module to trigger the function calls
    jest.isolateModules(() => {
      require("./client");
    });
  });

  it("should call initClientNavigation and initClient when client module is imported", () => {
    expect(initClientNavigation).toHaveBeenCalledTimes(1);
    expect(initClient).toHaveBeenCalledTimes(1);
  });

  it("should call initClientNavigation before initClient", () => {
    // Check that both functions were called once
    expect(initClientNavigation).toHaveBeenCalledTimes(1);
    expect(initClient).toHaveBeenCalledTimes(1);

    // Verify the order of calls - initClientNavigation should be called before initClient
    const initClientNavigationCallOrder = (initClientNavigation as jest.Mock).mock.invocationCallOrder[0];
    const initClientCallOrder = (initClient as jest.Mock).mock.invocationCallOrder[0];

    expect(initClientNavigationCallOrder).toBeLessThan(initClientCallOrder);
  });
});
import { describe, test, expect } from "vitest";
import {
  calculateLogStatsBetweenTwoUsers,
  calculateLogStatsOfUser,
} from "./expenses";

describe("calculateLogStatsBetweenTwoUsers", () => {
  test("should return total 3, diffSplitted 0, diffUnsplitted 0 when both users made the same expenses", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toMatchSnapshot(`should match {
      userTotalSplitted: 300,
      diffSplitted: 0,
      diffUnsplitted: 0,
    }`);
  });

  test("should return total 1, diffSplitted -2, diffUnsplitted -1 when user ows 1€", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toMatchSnapshot(`should match {
      userTotalSplitted: 100,
      diffSplitted: -200,
      diffUnsplitted: -100,
    }`);
  });

  test("should return total 3, diffSplitted 2, diffUnsplitted 1 when otherUser ows 1€", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 3, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toMatchSnapshot(`should match {
      userTotalSplitted: 300,
      diffSplitted: 200,
      diffUnsplitted: 100,
    }`);
  });
});

describe("calculateLogStatsOfUser", () => {
  test("should owe 0 to user2, and 1.5 to user3", () => {
    const user = "user1";
    const otherUsers = ["user2", "user3"];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
      { expense: 6, user: "user3" },
    ];

    const result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toMatchSnapshot("should be 150");
    expect(result.owedToUser).toMatchSnapshot("should be 0");

    expect(result.diffs.user2).toMatchSnapshot(`should be {
      userTotalSplitted: 300,
      diffSplitted: 0,
      diffUnsplitted: 0,
    }`);

    expect(result.diffs.user3).toMatchSnapshot(`should be {
      userTotalSplitted: 300,
      diffSplitted: -300,
      diffUnsplitted: -150,
    }`);
  });

  test("user2 should owe 2 to user1", () => {
    const user = "user1";
    const otherUsers = ["user2"];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    const result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toMatchSnapshot("should be 0");
    expect(result.owedToUser).toMatchSnapshot("should be 100");
    expect(result.diffs.user2).toMatchSnapshot(`should be {
      userTotalSplitted: 3,
      diffSplitted: 2,
      diffUnsplitted: 1,
    }`);
  });

  test("user2 should owe 2 to user1, and user3 should owe 1.5 to user1, but user3 should only owe 0.5 to user2", () => {
    const user = "user1";
    const otherUsers = ["user2", "user3"];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    let result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toMatchSnapshot("should be 0");
    expect(result.owedToUser).toMatchSnapshot("should be 250");
    expect(result.diffs.user2).toMatchSnapshot(`should be {
      userTotalSplitted: 300,
      diffSplitted: 200,
      diffUnsplitted: 100,
    }`);

    result = calculateLogStatsOfUser("user3", ["user2", "user1"], expenses);

    expect(result.userOwes).toMatchSnapshot("should be 200");
    expect(result.owedToUser).toMatchSnapshot("should be 0");
    expect(result.diffs.user2).toMatchSnapshot(`should be {
      userTotalSplitted: 0,
      diffSplitted: -100,
      diffUnsplitted: -50,
    }`);
  });
});

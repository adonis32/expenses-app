import { describe, test, expect } from "vitest";
import {
  calculateLogStats,
  calculateLogStatsBetweenTwoUsers,
  calculateLogStatsOfUser,
} from "./expenses";

describe("calculateLogStatsBetweenTwoUsers", () => {
  test("should return total 3, diffSplitted 0, diffUnsplitted 0 when both users made the same expenses", () => {
    const user = { uid: "user1" };
    const otherUser = { uid: "user2" };
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toEqual({
      userTotalSplitted: 3,
      diffSplitted: 0,
      diffUnsplitted: 0,
    });
  });

  test("should return total 1, diffSplitted -2, diffUnsplitted -1 when user ows 1€", () => {
    const user = { uid: "user1" };
    const otherUser = { uid: "user2" };
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toEqual({
      userTotalSplitted: 1,
      diffSplitted: -2,
      diffUnsplitted: -1,
    });
  });

  test("should return total 3, diffSplitted 2, diffUnsplitted 1 when otherUser ows 1€", () => {
    const user = { uid: "user1" };
    const otherUser = { uid: "user2" };
    const expenses = [
      { expense: 3, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(user, otherUser, expenses);

    expect(result).toEqual({
      userTotalSplitted: 3,
      diffSplitted: 2,
      diffUnsplitted: 1,
    });
  });
});

describe("calculateLogStatsOfUser", () => {
  test("should owe 0 to user2, and 1.5 to user3", () => {
    const user = { uid: "user1" };
    const otherUsers = [{ uid: "user2" }, { uid: "user3" }];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
      { expense: 6, user: "user3" },
    ];

    const result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toEqual(1.5);
    expect(result.owedToUser).toEqual(0);

    expect(result.diffs.user2).toEqual({
      userTotalSplitted: 3,
      diffSplitted: 0,
      diffUnsplitted: 0,
    });

    expect(result.diffs.user3).toEqual({
      userTotalSplitted: 3,
      diffSplitted: -3,
      diffUnsplitted: -1.5,
    });
  });

  test("user2 should owe 2 to user1", () => {
    const user = { uid: "user1" };
    const otherUsers = [{ uid: "user2" }];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    const result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toEqual(0);
    expect(result.owedToUser).toEqual(1);

    expect(result.diffs.user2).toEqual({
      userTotalSplitted: 3,
      diffSplitted: 2,
      diffUnsplitted: 1,
    });
  });

  test("user2 should owe 2 to user1, and user3 should owe 1.5 to user1, but user3 should only owe 0.5 to user2", () => {
    const user = { uid: "user1" };
    const otherUsers = [{ uid: "user2" }, { uid: "user3" }];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    let result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expect(result.userOwes).toEqual(0);
    expect(result.owedToUser).toEqual(2.5);

    expect(result.diffs.user2).toEqual({
      userTotalSplitted: 3,
      diffSplitted: 2,
      diffUnsplitted: 1,
    });

    result = calculateLogStatsOfUser(
      { uid: "user3" },
      [{ uid: "user2" }, { uid: "user1" }],
      expenses
    );

    expect(result.userOwes).toEqual(2);
    expect(result.owedToUser).toEqual(0);

    expect(result.diffs.user2).toEqual({
      userTotalSplitted: 0,
      diffSplitted: -1,
      diffUnsplitted: -0.5,
    });
  });
});

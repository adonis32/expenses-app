import Dinero from "dinero.js";
import { describe, test, expect } from "vitest";
import {
  calculateLogStatsBetweenTwoUsers,
  calculateLogStatsOfUser,
  ExpenseInput,
} from "./expenses";

describe("calculateLogStatsBetweenTwoUsers", () => {
  test("should return diffUnsplitted=0 when users spend the same amount", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(0);
  });

  test("should return diffUnsplitted=-100 when user1 paid 100 and user2 paid 300", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 3, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(-100);
  });

  test("should return diffUnsplitted=100 when user1 paid 300 and user2 paid 100", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses = [
      { expense: 3, user: "user1" },
      { expense: 1, user: "user2" },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(100);
  });
});

describe("ExpenseV2 calculateLogStatsBetweenTwoUsers", () => {
  test("should return diffUnsplitted=0 when users spend the same amount", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses: ExpenseInput[] = [
      {
        version: 2,
        expense: 100,
        user: "user1",
        paidBy: "user1",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
      {
        version: 2,
        expense: 200,
        user: "user1",
        paidBy: "user1",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
      {
        version: 2,
        expense: 300,
        user: "user2",
        paidBy: "user2",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(0);
  });

  test("should return diffUnsplitted=-100 when expenses splits are 50%, user1 paid 100, and user1 paid 300", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses: ExpenseInput[] = [
      {
        version: 2,
        expense: 100,
        user: "user1",
        paidBy: "user1",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
      {
        version: 2,
        expense: 300,
        user: "user2",
        paidBy: "user2",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(-100);
  });

  test("should return diffUnsplitted=100 when expenses splits are 50%, user1 paid 300, and user2 paid 100", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses: ExpenseInput[] = [
      {
        version: 2,
        expense: 300,
        user: "user1",
        paidBy: "user1",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
      {
        version: 2,
        expense: 100,
        user: "user2",
        paidBy: "user2",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(100);
  });

  test("should return diffUnsplitted=0 when expenses are splitted evenly", () => {
    const user = "user1";
    const otherUser = "user2";
    const expenses: ExpenseInput[] = [
      {
        version: 2,
        expense: 200,
        user: "user1",
        paidBy: "user1",
        splittedWith: { user1: 0.75, user2: 0.25 },
      },
      {
        version: 2,
        expense: 100,
        user: "user2",
        paidBy: "user2",
        splittedWith: { user1: 0.5, user2: 0.5 },
      },
    ];

    const result = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses,
      0.5
    );

    expectDinero(result.diffUnsplitted).toEqual(0);
  });
});

describe("calculateLogStatsOfUser", () => {
  test("should owe 0 to user2, and 100 to user3", () => {
    const user = "user1";
    const otherUsers = ["user2", "user3"];
    const expenses = [
      { expense: 1, user: "user1" },
      { expense: 2, user: "user1" },
      { expense: 3, user: "user2" },
      { expense: 6, user: "user3" },
    ];

    const result = calculateLogStatsOfUser(user, otherUsers, expenses);

    expectDinero(result.userOwes).toEqual(100);
    expectDinero(result.owedToUser).toEqual(0);

    expectDinero(result.diffs.user2.diffUnsplitted).toEqual(0);
    expectDinero(result.diffs.user3.diffUnsplitted).toEqual(-100);
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

    expectDinero(result.userOwes).toEqual(0);
    expectDinero(result.owedToUser).toEqual(100);
    expectDinero(result.diffs.user2.diffUnsplitted).toEqual(100);
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

    expectDinero(result.userOwes).toEqual(0);
    expectDinero(result.owedToUser).toEqual(167);
    expectDinero(result.diffs.user2.diffUnsplitted).toEqual(67);

    result = calculateLogStatsOfUser("user3", ["user2", "user1"], expenses);

    expectDinero(result.userOwes).toEqual(133);
    expectDinero(result.owedToUser).toEqual(0);
    expectDinero(result.diffs.user2.diffUnsplitted).toEqual(-33);
  });
});

function expectDinero(dinero: Dinero.Dinero) {
  return expect(dinero.getAmount());
}

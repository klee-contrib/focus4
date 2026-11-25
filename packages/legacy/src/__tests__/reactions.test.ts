import {afterEach, describe, expect, test, vi} from "vitest";

import {classAutorun, classReaction, classWhen} from "../reactions";

const mobx = vi.hoisted(() => ({
    autorun: vi.fn(),
    reaction: vi.fn(),
    when: vi.fn()
}));

vi.mock("mobx", () => ({
    autorun: mobx.autorun,
    reaction: mobx.reaction,
    when: mobx.when
}));

type Context = ClassMethodDecoratorContext<any>;

function applyDecorator(
    decorator: (method: (...args: any[]) => any, context: Context) => void,
    method: (...args: any[]) => any,
    name = "tracked"
) {
    const initializers: (() => void)[] = [];
    const context = {
        name,
        addInitializer(initializer: () => void) {
            initializers.push(initializer);
        }
    } as Context;

    decorator(method, context);
    return initializers;
}

function mount(initializers: (() => void)[], instance: any) {
    for (const initializer of initializers) {
        initializer.call(instance);
    }
    // oxlint-disable-next-line new-cap
    instance.UNSAFE_componentWillMount();
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("classAutorun", () => {
    test("pose et dispose un autorun sans hooks existants", () => {
        const dispose = vi.fn();
        const method = vi.fn();
        mobx.autorun.mockReturnValue(dispose);
        const initializers = applyDecorator(classAutorun, method);
        const instance = {};

        mount(initializers, instance);

        expect(mobx.autorun).toHaveBeenCalledOnce();
        expect(mobx.autorun.mock.calls[0][0]).toBeTypeOf("function");
        (instance as any).componentWillUnmount();
        expect(dispose).toHaveBeenCalledOnce();
    });

    test("chaîne les hooks de cycle de vie existants", () => {
        const dispose = vi.fn();
        const baseMount = vi.fn();
        const baseUnmount = vi.fn();
        mobx.autorun.mockReturnValue(dispose);
        const initializers = applyDecorator(classAutorun, vi.fn());
        const instance = {UNSAFE_componentWillMount: baseMount, componentWillUnmount: baseUnmount};

        mount(initializers, instance);
        (instance as any).componentWillUnmount();

        expect(baseMount).toHaveBeenCalledOnce();
        expect(baseUnmount).toHaveBeenCalledOnce();
        expect(dispose).toHaveBeenCalledOnce();
    });
});

describe("classReaction", () => {
    test("passe l'expression, la méthode liée et les options à reaction", () => {
        const dispose = vi.fn();
        const method = vi.fn(function method(this: {value: number}, value: number) {
            this.value = value;
        });
        const expression = vi.fn(function expression(this: unknown, instance: any) {
            return () => instance.source;
        });
        const options = {fireImmediately: true};
        mobx.reaction.mockReturnValue(dispose);
        const initializers = applyDecorator(classReaction(expression, options), method);
        const instance = {source: 42, value: 0};

        mount(initializers, instance);

        expect(expression).toHaveBeenCalledWith(instance);
        expect(mobx.reaction).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), options);
        mobx.reaction.mock.calls[0][1](42);
        expect(instance.value).toBe(42);

        (instance as any).componentWillUnmount();
        expect(dispose).toHaveBeenCalledOnce();
    });
});

describe("classWhen", () => {
    test("pose et dispose un when", () => {
        const dispose = vi.fn();
        const method = vi.fn();
        const expression = vi.fn((instance: any) => () => instance.ready);
        mobx.when.mockReturnValue(dispose);
        const initializers = applyDecorator(classWhen(expression), method);
        const instance = {ready: true};

        mount(initializers, instance);

        expect(expression).toHaveBeenCalledWith(instance);
        expect(mobx.when).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
        (instance as any).componentWillUnmount();
        expect(dispose).toHaveBeenCalledOnce();
    });
});

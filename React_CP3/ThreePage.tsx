import { useState, type FormEvent, type ReactNode } from "react";
import {BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";

type Task = {
    id: number;
    title: string;
    done: boolean;
};
interface Product {
    id: number;
    title: string;
    price: number;
}
const initialProducts: Product[] = [
    { id: 1, title: "Claude Max", price: 2500 },
    { id: 2, title: "ChatGPT", price: 2700 },
    { id: 3, title: "Gemini", price: 150 },
];

function HomePage() {
    return <h1>Главная страница</h1>;
}
function AboutPage() {
    return <h1>О проекте</h1>;
}
function NotFoundPage() {
    return <h1>404 — Страница не найдена</h1>;
}
function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    function addTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (title.trim() === "") return;
        const newTask: Task = {
            id: Date.now(),
            title: title,
            done: false,
        };
        setTasks([...tasks, newTask]);
        setTitle("");
    }
    function toggleTask(id: number) {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, done: !task.done } : task
            )
        );
    }
    function deleteTask(id: number) {
        setTasks(tasks.filter((task) => task.id !== id));
    }
    return (
        <main>
            <h1>Задачи</h1>
            <form onSubmit={addTask}>
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Новая задача"
                />
                <button type="submit">Добавить</button>
            </form>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.title}</span>
                        <button type="button" onClick={() => deleteTask(task.id)}>
                            Удалить
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

function ProductCatalog() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchParams, setSearchParams] = useSearchParams();
    if (!searchParams.get("category")) {
        return <Navigate to="/products?category=all" replace />;
    }
    const sort = searchParams.get("sort");
    const handleAddProduct = () => {
        const newProduct: Product = {
            id: Date.now(),
            title: `Новый товар #${products.length + 1}`,
            price: Math.floor(Math.random() * 3000) + 100,
        };
        setProducts((prev) => [...prev, newProduct]);
    };
    const sortedProducts = [...products].sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return 0;
    });
    return (
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 15 }}>
                <button onClick={handleAddProduct}>+ Добавить продукт</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                <button onClick={() => setSearchParams({ category: "all", sort: "price-asc" })}>
                    По возрастанию цены
                </button>
                <button onClick={() => setSearchParams({ category: "all", sort: "price-desc" })}>
                    По убыванию цены
                </button>
            </div>
            <ul>
                {sortedProducts.map((item) => (
                    <li key={item.id}>
                        <Link to={`/products/${item.id}`}>
                            {item.title} — {item.price} ₽
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const product = initialProducts.find((item) => item.id === Number(id));
    return (
        <div>
            <h1>Товар #{id}</h1>
            <p>{product ? `${product.title} — ${product.price} ₽` : "Товар не найден"}</p>
            <Link to="/products">Назад в каталог</Link>
        </div>
    );
}

function PrivateRoute({ isAuth, children }: { isAuth: boolean; children: ReactNode }) {
    const location = useLocation();
    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

    function handleLogin() {
        onLogin();
        navigate(from, { replace: true });
    }

    return (
        <div>
            <h1>Страница входа</h1>
            <button onClick={handleLogin}>Войти</button>
        </div>
    );
}

export default function ThreePage() {
    const [isAuth, setIsAuth] = useState(false);

    return (
        <BrowserRouter>
            <nav>
                <NavLink to="/">Главная</NavLink>{" "}
                <NavLink to="/products">Каталог</NavLink>{" "}
                <NavLink to="/tasks">Задачи</NavLink>{" "}
                <NavLink to="/about">О проекте</NavLink>{" "}
                <NavLink to="/login">Вход</NavLink>
            </nav>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route
                    path="/tasks"
                    element={
                        <PrivateRoute isAuth={isAuth}>
                            <TasksPage />
                        </PrivateRoute>
                    }
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage onLogin={() => setIsAuth(true)} />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}
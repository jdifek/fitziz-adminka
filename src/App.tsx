import { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";
import "./App.css";

// Интерфейсы для типизации
interface Mask {
  id: number;
  name: string;
  instructions: string;
}

interface CatalogItem {
  id: number;
  name: string;
  description: string;
  link: string;
  maskId?: number | null;
}

interface Video {
  id: number;
  title: string;
  url: string;
}

interface User {
  id: number;
  telegramId: string;
  firstName: string;
  phone?: string | null;
  email?: string | null;
  maskId?: number | null;
}

interface MaskForm {
  name: string;
  instructions: string;
}

interface CatalogForm {
  name: string;
  description: string;
  link: string;
  maskId: string;
}

interface VideoForm {
  title: string;
  url: string;
}

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [token, setToken] = useState<string>(
    localStorage.getItem("adminToken") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
  const [activeTab, setActiveTab] = useState<
    "masks" | "catalog" | "videos" | "users"
  >("masks");
  const [error, setError] = useState<string>("");

  // Состояния для авторизации
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Состояния для масок
  const [masks, setMasks] = useState<Mask[]>([]);
  const [maskForm, setMaskForm] = useState<MaskForm>({
    name: "",
    instructions: "",
  });
  const [maskEditingId, setMaskEditingId] = useState<number | null>(null);

  // Состояния для каталога
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>({
    name: "",
    description: "",
    link: "",
    maskId: "",
  });
  const [catalogEditingId, setCatalogEditingId] = useState<number | null>(null);

  // Состояния для видео
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoForm, setVideoForm] = useState<VideoForm>({ title: "", url: "" });
  const [videoEditingId, setVideoEditingId] = useState<number | null>(null);

  // Состояния для пользователей
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<string>("");

  // Функции для авторизации
  const handleLogin = async (): Promise<void> => {
    try {
      const response: AxiosResponse<{ token: string }> = await axios.post(
        `${API_URL}/admin/login`,
        { username, password }
      );
      const { token } = response.data;
      localStorage.setItem("adminToken", token);
      setToken(token);
      setIsLoggedIn(true);
      setError("");
    } catch (err) {
      setError("Неверный логин или пароль");
    }
  };

  // Функции для масок
  const fetchMasks = async (): Promise<void> => {
    try {
      const response: AxiosResponse<Mask[]> = await axios.get(
        `${API_URL}/masks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMasks(response.data);
    } catch (error) {
      console.error("Ошибка загрузки масок:", error);
    }
  };

  const handleMaskSubmit = async (): Promise<void> => {
    try {
      if (maskEditingId) {
        await axios.put(`${API_URL}/admin/masks/${maskEditingId}`, maskForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/admin/masks`, maskForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchMasks();
      setMaskForm({ name: "", instructions: "" });
      setMaskEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения маски:", error);
    }
  };

  const handleMaskEdit = (mask: Mask): void => {
    setMaskForm({ name: mask.name, instructions: mask.instructions });
    setMaskEditingId(mask.id);
  };

  const handleMaskDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/masks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMasks();
    } catch (error) {
      console.error("Ошибка удаления маски:", error);
    }
  };

  // Функции для каталога
  const fetchCatalogItems = async (): Promise<void> => {
    try {
      const response: AxiosResponse<CatalogItem[]> = await axios.get(
        `${API_URL}/catalog`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCatalogItems(response.data);
    } catch (error) {
      console.error("Ошибка загрузки каталога:", error);
    }
  };

  const handleCatalogSubmit = async (): Promise<void> => {
    try {
      if (catalogEditingId) {
        await axios.put(
          `${API_URL}/admin/catalog/${catalogEditingId}`,
          catalogForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${API_URL}/admin/catalog`, catalogForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCatalogItems();
      setCatalogForm({ name: "", description: "", link: "", maskId: "" });
      setCatalogEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения каталога:", error);
    }
  };

  const handleCatalogEdit = (item: CatalogItem): void => {
    setCatalogForm({
      name: item.name,
      description: item.description,
      link: item.link,
      maskId: item.maskId?.toString() || "",
    });
    setCatalogEditingId(item.id);
  };

  const handleCatalogDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/catalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCatalogItems();
    } catch (error) {
      console.error("Ошибка удаления каталога:", error);
    }
  };

  // Функции для видео
  const fetchVideos = async (): Promise<void> => {
    try {
      const response: AxiosResponse<Video[]> = await axios.get(
        `${API_URL}/videos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Ошибка загрузки видео:", error);
    }
  };

  const handleVideoSubmit = async (): Promise<void> => {
    try {
      if (videoEditingId) {
        await axios.put(
          `${API_URL}/admin/videos/${videoEditingId}`,
          videoForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${API_URL}/admin/videos`, videoForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchVideos();
      setVideoForm({ title: "", url: "" });
      setVideoEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения видео:", error);
    }
  };

  const handleVideoEdit = (video: Video): void => {
    setVideoForm({ title: video.title, url: video.url });
    setVideoEditingId(video.id);
  };

  const handleVideoDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVideos();
    } catch (error) {
      console.error("Ошибка удаления видео:", error);
    }
  };

  // Функции для пользователей
  const fetchUsers = async (): Promise<void> => {
    try {
      const response: AxiosResponse<User[]> = await axios.get(
        `${API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: userFilter ? { telegramId: userFilter } : undefined,
        }
      );
      
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка  загрузки пользователей:", error);
    }
  };

  const handleUserDelete = async (telegramId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/users/${telegramId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMasks();
      fetchCatalogItems();
      fetchVideos();
      fetchUsers();
    }
  }, [isLoggedIn, userFilter]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen  flex items-center justify-center bg-gray-100">
        <div className="w-full h-full p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Вход в админку
          </h2>
          {error && (
            <p className="text-red-500 mb-4 text-center">
              Неверный логин или пароль
            </p>
          )}
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
          />
          <button
            onClick={handleLogin}
            className="w-full p-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-100 py-8">
  <div className="w-full h-full px-4">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          FITSIZ Admin Panel
        </h1>
        <nav className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors ${
              activeTab === "masks"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("masks")}
          >
            Маски
          </button>
          <button
            className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors ${
              activeTab === "catalog"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("catalog")}
          >
            Каталог
          </button>
          <button
            className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors ${
              activeTab === "videos"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("videos")}
          >
            Видео
          </button>
          <button
            className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("users")}
          >
            Пользователи
          </button>
          <button
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
            onClick={() => {
              localStorage.removeItem("adminToken");
              setToken("");
              setIsLoggedIn(false);
            }}
          >
            Выйти
          </button>
        </nav>

        {activeTab === "masks" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление масками
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Название маски"
                value={maskForm.name}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, name: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Инструкции"
                value={maskForm.instructions}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, instructions: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <button
                onClick={handleMaskSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {maskEditingId ? "Обновить" : "Добавить"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-lime-100">
                    <th className="p-4 text-left text-black font-semibold">
                      ID
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Название
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Инструкции
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {masks.map((mask, index) => (
                    <tr
                      key={mask.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{mask.id}</td>
                      <td className="p-4 text-black">{mask.name}</td>
                      <td className="p-4 text-black">{mask.instructions}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleMaskEdit(mask)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleMaskDelete(mask.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление каталогом
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Название"
                value={catalogForm.name}
                onChange={(e) =>
                  setCatalogForm({ ...catalogForm, name: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Описание"
                value={catalogForm.description}
                onChange={(e) =>
                  setCatalogForm({
                    ...catalogForm,
                    description: e.target.value,
                  })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Ссылка"
                value={catalogForm.link}
                onChange={(e) =>
                  setCatalogForm({ ...catalogForm, link: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="number"
                placeholder="ID маски"
                value={catalogForm.maskId}
                onChange={(e) =>
                  setCatalogForm({ ...catalogForm, maskId: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <button
                onClick={handleCatalogSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {catalogEditingId ? "Обновить" : "Добавить"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-lime-100">
                    <th className="p-4 text-left text-black font-semibold">
                      ID
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Название
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Описание
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Ссылка
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      ID маски
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catalogItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{item.id}</td>
                      <td className="p-4 text-black">{item.name}</td>
                      <td className="p-4 text-black">{item.description}</td>
                      <td className="p-4 text-black">{item.link}</td>
                      <td className="p-4 text-black">{item.maskId ?? "-"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleCatalogEdit(item)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleCatalogDelete(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление видео
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Название видео"
                value={videoForm.title}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, title: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="URL видео"
                value={videoForm.url}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, url: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <button
                onClick={handleVideoSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {videoEditingId ? "Обновить" : "Добавить"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-lime-100">
                    <th className="p-4 text-left text-black font-semibold">
                      ID
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Название
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      URL
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video, index) => (
                    <tr
                      key={video.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{video.id}</td>
                      <td className="p-4 text-black">{video.title}</td>
                      <td className="p-4 text-black">{video.url}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleVideoEdit(video)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleVideoDelete(video.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление пользователями
            </h2>
            <input
              type="text"
              placeholder="Фильтр по Telegram ID"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-lime-100">
                    <th className="p-4 text-left text-black font-semibold">
                      ID
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Telegram ID
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Имя
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Телефон
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Email
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      ID маски
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{user.id}</td>
                      <td className="p-4 text-black">{user.telegramId}</td>
                      <td className="p-4 text-black">{user.firstName}</td>
                      <td className="p-4 text-black">{user.phone ?? "-"}</td>
                      <td className="p-4 text-black">{user.email ?? "-"}</td>
                      <td className="p-4 text-black">{user.maskId ?? "-"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUserDelete(user.telegramId)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

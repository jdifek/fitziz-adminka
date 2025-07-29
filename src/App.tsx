import { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";
import "./App.css";

// Интерфейсы для типизации
interface Mask {
  id: number;
  extraFields?: {
    id: number;
    key: string;
    value: string;
  }[];
  name: string;
  instructions: string | null;
  imageUrl: string | null;
  price: string | null;
  weight: string | null;
  viewArea: string | null;
  sensors: number | null;
  power: string | null;
  shadeRange: string | null;
  material: string | null;
  description: string | null; // Из CatalogItem
  link: string | null; // Из CatalogItem
  installment: string | null; // Из CatalogItem
  size: string | null; // Из CatalogItem
  days: string | null; // Из CatalogItem
  features: Feature[];
  reviews: Review[];
}

interface Video {
  id: number;
  title: string;
  url: string | null;
  description: string | null;
  duration: string | null;
  thumbnailUrl: string | null;
}

interface User {
  id: number;
  telegramId: string;
  firstName: string | null;
  phone: string | null;
  email: string | null;
  maskId: number | null;
  mask?: Mask; // Для отображения имени маски
}

interface Feature {
  id: number;
  name: string;
  maskId: number;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string | null;
  maskId: number | null;
}

interface MaskForm {
  name: string;
  instructions: string;
  imageUrl: string;
  price: string;
  weight: string;
  viewArea: string;
  sensors: string;
  power: string;
  shadeRange: string;
  material: string;
  description: string;
  link: string;
  installment: string;
  size: string;
  days: string;
}

interface VideoForm {
  title: string;
  url: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
}

interface FeatureForm {
  name: string;
  maskId: string;
}
interface Setting {
  key: string;
  value: string;
}

interface ReviewForm {
  userName: string;
  rating: string;
  comment: string;
  maskId: string;
}

interface UserForm {
  telegramId: string;
  maskId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

function App() {
  const [token, setToken] = useState<string>(
    localStorage.getItem("adminToken") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
  const [activeTab, setActiveTab] = useState<
    "masks" | "settings" | "videos" | "users" | "features" | "reviews"
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
    imageUrl: "",
    price: "",
    weight: "",
    viewArea: "",
    sensors: "",
    power: "",
    shadeRange: "",
    material: "",
    description: "",
    link: "",
    installment: "",
    size: "",
    days: "",
  });
  const [maskEditingId, setMaskEditingId] = useState<number | null>(null);

  // Состояния для видео
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: "",
    url: "",
    description: "",
    duration: "",
    thumbnailUrl: "",
  });
  const [videoEditingId, setVideoEditingId] = useState<number | null>(null);

  const [, setSettings] = useState<Setting[]>([]);
  const [pushMessage, setPushMessage] = useState<string>("");
  const [addMaskMessage, setAddMaskMessage] = useState<string>("");
  // Состояния для пользователей
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<string>("");
  const [userForm, setUserForm] = useState<UserForm>({
    telegramId: "",
    maskId: "",
  });
  const [userEditingId, setUserEditingId] = useState<string | null>(null);

  // Состояния для особенностей
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureForm, setFeatureForm] = useState<FeatureForm>({
    name: "",
    maskId: "",
  });
  const [featureEditingId, setFeatureEditingId] = useState<number | null>(null);
  const [extraFields, setExtraFields] = useState([{ key: "", value: "" }]);

  // Состояния для отзывов
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    userName: "",
    rating: "",
    comment: "",
    maskId: "",
  });
  const [reviewEditingId, setReviewEditingId] = useState<number | null>(null);

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
    } catch {
      setError("Неверный логин или пароль");
    }
  };
  // Функции для настроек
  const fetchSettings = async (): Promise<void> => {
    try {
      const response: AxiosResponse<Setting[]> = await axios.get(
        `${API_URL}/admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSettings(response.data);
      const addMaskMsg = response.data.find(
        (s) => s.key === "TG_MESSAGE_ON_ADD_MASK"
      )?.value;
      setAddMaskMessage(addMaskMsg || "");
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
      setError("Не удалось загрузить настройки");
    }
  };

  const handlePushSubmit = async (): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/admin/send-message`,
        { text: pushMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPushMessage("");
      setError("Сообщение успешно отправлено всем пользователям");
    } catch (error) {
      console.error("Ошибка отправки пуш-уведомления:", error);
      setError("Не удалось отправить пуш-уведомление");
    }
  };

  const handleAddMaskMessageSubmit = async (): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/admin/settings`,
        { key: "TG_MESSAGE_ON_ADD_MASK", value: addMaskMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setError("Сообщение для добавления маски успешно обновлено");
    } catch (error) {
      console.error("Ошибка обновления сообщения для маски:", error);
      setError("Не удалось обновить сообщение для маски");
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
      setError("Не удалось загрузить маски");
    }
  };

  const handleMaskSubmit = async (): Promise<void> => {
    try {
      const payload = {
        ...maskForm,
        extraFields,
        sensors: maskForm.sensors ? parseInt(maskForm.sensors) : null,
      };
      if (maskEditingId) {
        await axios.put(`${API_URL}/admin/masks/${maskEditingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/admin/masks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchMasks();
      setMaskForm({
        name: "",
        instructions: "",
        imageUrl: "",
        price: "",
        weight: "",
        viewArea: "",
        sensors: "",
        power: "",
        shadeRange: "",
        material: "",
        description: "",
        link: "",
        installment: "",
        size: "",
        days: "",
      });
      setMaskEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения маски:", error);
      setError("Не удалось сохранить маску");
    }
  };

  const handleMaskEdit = (mask: Mask): void => {
    setMaskForm({
      name: mask.name,
      instructions: mask.instructions || "",
      imageUrl: mask.imageUrl || "",
      price: mask.price || "",
      weight: mask.weight || "",
      viewArea: mask.viewArea || "",
      sensors: mask.sensors?.toString() || "",
      power: mask.power || "",
      shadeRange: mask.shadeRange || "",
      material: mask.material || "",
      description: mask.description || "",
      link: mask.link || "",
      installment: mask.installment || "",
      size: mask.size || "",
      days: mask.days || "",
    });
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
      setError("Не удалось удалить маску");
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
      setError("Не удалось загрузить видео");
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
      setVideoForm({
        title: "",
        url: "",
        description: "",
        duration: "",
        thumbnailUrl: "",
      });
      setVideoEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения видео:", error);
      setError("Не удалось сохранить видео");
    }
  };

  const handleVideoEdit = (video: Video): void => {
    setVideoForm({
      title: video.title,
      url: video.url || "",
      description: video.description || "",
      duration: video.duration || "",
      thumbnailUrl: video.thumbnailUrl || "",
    });
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
      setError("Не удалось удалить видео");
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
      console.error("Ошибка загрузки пользователей:", error);
      setError("Не удалось загрузить пользователей");
    }
  };

  const handleUserSubmit = async (): Promise<void> => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userForm.telegramId}`,
        {
          maskId: userForm.maskId ? parseInt(userForm.maskId) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      setUserForm({ telegramId: "", maskId: "" });
      setUserEditingId(null);
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
      setError("Не удалось обновить пользователя");
    }
  };

  const handleUserEdit = (user: User): void => {
    setUserForm({
      telegramId: user.telegramId,
      maskId: user.maskId?.toString() || "",
    });
    setUserEditingId(user.telegramId);
  };

  const handleUserDelete = async (telegramId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/users/${telegramId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      setError("Не удалось удалить пользователя");
    }
  };

  // Функции для особенностей
  const fetchFeatures = async (): Promise<void> => {
    try {
      const response: AxiosResponse<Feature[]> = await axios.get(
        `${API_URL}/admin/features`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeatures(response.data);
    } catch (error) {
      console.error("Ошибка загрузки особенностей:", error);
      setError("Не удалось загрузить особенности");
    }
  };

  const handleFeatureSubmit = async (): Promise<void> => {
    try {
      const payload = {
        name: featureForm.name,
        maskId: parseInt(featureForm.maskId),
      };
      if (featureEditingId) {
        await axios.put(
          `${API_URL}/admin/features/${featureEditingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${API_URL}/admin/features`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchFeatures();
      setFeatureForm({ name: "", maskId: "" });
      setFeatureEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения особенности:", error);
      setError("Не удалось сохранить особенность");
    }
  };

  const handleFeatureEdit = (feature: Feature): void => {
    setFeatureForm({
      name: feature.name,
      maskId: feature.maskId.toString(),
    });
    setFeatureEditingId(feature.id);
  };

  const handleFeatureDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/features/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeatures();
    } catch (error) {
      console.error("Ошибка удаления особенности:", error);
      setError("Не удалось удалить особенность");
    }
  };

  // Функции для отзывов
  const fetchReviews = async (): Promise<void> => {
    try {
      const response: AxiosResponse<Review[]> = await axios.get(
        `${API_URL}/admin/reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews(response.data);
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
      setError("Не удалось загрузить отзывы");
    }
  };

  const handleReviewSubmit = async (): Promise<void> => {
    try {
      const payload = {
        userName: reviewForm.userName,
        rating: parseFloat(reviewForm.rating),
        comment: reviewForm.comment,
        maskId: reviewForm.maskId ? parseInt(reviewForm.maskId) : null,
      };
      if (reviewEditingId) {
        await axios.put(
          `${API_URL}/admin/reviews/${reviewEditingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${API_URL}/admin/reviews`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchReviews();
      setReviewForm({ userName: "", rating: "", comment: "", maskId: "" });
      setReviewEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения отзыва:", error);
      setError("Не удалось сохранить отзыв");
    }
  };

  const handleReviewEdit = (review: Review): void => {
    setReviewForm({
      userName: review.userName,
      rating: review.rating.toString(),
      comment: review.comment || "",
      maskId: review.maskId?.toString() || "",
    });
    setReviewEditingId(review.id);
  };

  const handleReviewDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (error) {
      console.error("Ошибка удаления отзыва:", error);
      setError("Не удалось удалить отзыв");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMasks();
      fetchVideos();
      fetchUsers();
      fetchFeatures();
      fetchReviews();
      fetchSettings();

    }
  }, [isLoggedIn, userFilter]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Вход в админку
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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
      <div className="w-full max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          FITSIZ Admin Panel
        </h1>
        <nav className="flex flex-wrap justify-center gap-4 mb-8">
        <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "settings"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("settings")}
          >
            Настройки
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "masks"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("masks")}
          >
            Маски
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "videos"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("videos")}
          >
            Видео
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("users")}
          >
            Пользователи
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "features"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("features")}
          >
            Особенности
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
              activeTab === "reviews"
                ? "bg-lime-400 text-black"
                : "bg-white text-black hover:bg-lime-100"
            } shadow-md`}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы
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

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

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
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Инструкции"
                value={maskForm.instructions}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, instructions: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="URL изображения"
                value={maskForm.imageUrl}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, imageUrl: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Цена"
                value={maskForm.price}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, price: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Вес"
                value={maskForm.weight}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, weight: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Область обзора"
                value={maskForm.viewArea}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, viewArea: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="number"
                placeholder="Сенсоры"
                value={maskForm.sensors}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, sensors: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Питание"
                value={maskForm.power}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, power: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Диапазон затемнения"
                value={maskForm.shadeRange}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, shadeRange: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Материал"
                value={maskForm.material}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, material: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Описание"
                value={maskForm.description}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, description: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Ссылка"
                value={maskForm.link}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, link: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Рассрочка"
                value={maskForm.installment}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, installment: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Размер"
                value={maskForm.size}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, size: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Дни доставки"
                value={maskForm.days}
                onChange={(e) =>
                  setMaskForm({ ...maskForm, days: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <h3 className="text-xl font-semibold text-black">
                Доп. характеристики
              </h3>
              {extraFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Название"
                    value={field.key}
                    onChange={(e) =>
                      setExtraFields((prev) => {
                        const updated = [...prev];
                        updated[index].key = e.target.value;
                        return updated;
                      })
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-black placeholder:text-black/60"
                  />
                  <input
                    type="text"
                    placeholder="Значение"
                    value={field.value}
                    onChange={(e) =>
                      setExtraFields((prev) => {
                        const updated = [...prev];
                        updated[index].value = e.target.value;
                        return updated;
                      })
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-black placeholder:text-black/60"
                  />
                  <button
                    onClick={() =>
                      setExtraFields((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setExtraFields([...extraFields, { key: "", value: "" }])
                }
                className="w-fit px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-white"
              >
                + Добавить поле
              </button>

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
                      Изображение
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Цена
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Вес
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Область обзора
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Сенсоры
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Питание
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Диапазон затемнения
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Материал
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Описание
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Ссылка
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Рассрочка
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Размер
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Дни доставки
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Доп. характеристики
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
                      <td className="p-4 text-black">
                        {mask.instructions ?? "-"}
                      </td>
                      <td className="p-4 text-black">
                        {mask.imageUrl ? (
                          <img src={mask.imageUrl} alt="" className="h-12" />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 text-black">{mask.price ?? "-"}</td>
                      <td className="p-4 text-black">{mask.weight ?? "-"}</td>
                      <td className="p-4 text-black">{mask.viewArea ?? "-"}</td>
                      <td className="p-4 text-black">{mask.sensors ?? "-"}</td>
                      <td className="p-4 text-black">{mask.power ?? "-"}</td>
                      <td className="p-4 text-black">
                        {mask.shadeRange ?? "-"}
                      </td>
                      <td className="p-4 text-black">{mask.material ?? "-"}</td>
                      <td className="p-4 text-black">
                        {mask.description ?? "-"}
                      </td>
                      <td className="p-4 text-black">{mask.link ?? "-"}</td>
                      <td className="p-4 text-black">
                        {mask.installment ?? "-"}
                      </td>
                      <td className="p-4 text-black">{mask.size ?? "-"}</td>

                      <td className="p-4 text-black">{mask.days ?? "-"}</td>
                      <td className="p-4 text-black">
                        {mask && mask.extraFields && mask.extraFields?.length > 0 ? (
                          <ul className="space-y-1">
                            {mask.extraFields.map((f, i) => (
                              <li key={i}>
                                <strong>{f.key}:</strong> {f.value}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "-"
                        )}
                      </td>
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

{activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Настройки уведомлений
            </h2>
            <div className="flex flex-col gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  Отправить пуш-уведомление всем пользователям
                </h3>
                <textarea
                  placeholder="Введите сообщение для отправки всем пользователям"
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60 min-h-[100px]"
                />
                <button
                  onClick={handlePushSubmit}
                  className="mt-2 px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
                >
                  Отправить
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  Сообщение при добавлении маски
                </h3>
                <textarea
                  placeholder="Введите сообщение, которое будет отправляться при добавлении маски"
                  value={addMaskMessage}
                  onChange={(e) => setAddMaskMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60 min-h-[100px]"
                />
                <button
                  onClick={handleAddMaskMessageSubmit}
                  className="mt-2 px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
                >
                  Сохранить
                </button>
              </div>
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
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="URL видео"
                value={videoForm.url}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, url: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Описание"
                value={videoForm.description}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, description: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Длительность"
                value={videoForm.duration}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, duration: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="URL миниатюры"
                value={videoForm.thumbnailUrl}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
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
                      Описание
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Длительность
                    </th>
                    <th className="p-4 text-left text-black  font-semibold">
                      Миниатюра
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
                      <td className="p-4 text-black">{video.url ?? "-"}</td>
                      <td className="p-4 text-black">
                        {video.description ?? "-"}
                      </td>
                      <td className="p-4 text-black">
                        {video.duration ?? "-"}
                      </td>
                      <td className="p-4 text-black max-w-[200px] truncate">
                        {video.thumbnailUrl ?? "-"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleVideoEdit(video)}
                          className="mr-4 mb-2 text-lime-400 hover:text-lime-500 transition-colors"
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
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Telegram ID"
                value={userForm.telegramId}
                onChange={(e) =>
                  setUserForm({ ...userForm, telegramId: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
                disabled={!!userEditingId}
              />
              <select
                value={userForm.maskId}
                onChange={(e) =>
                  setUserForm({ ...userForm, maskId: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black"
              >
                <option value="">Выберите маску</option>
                {masks.map((mask) => (
                  <option key={mask.id} value={mask.id}>
                    {mask.name} (ID: {mask.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleUserSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {userEditingId ? "Обновить" : "Добавить"}
              </button>
            </div>
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
                      Маска
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
                      <td className="p-4 text-black">
                        {user.firstName ?? "-"}
                      </td>
                      <td className="p-4 text-black">{user.phone ?? "-"}</td>
                      <td className="p-4 text-black">{user.email ?? "-"}</td>
                      <td className="p-4 text-black">
                        {user.mask
                          ? `${user.mask.name} (ID: ${user.maskId})`
                          : "-"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUserEdit(user)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
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

        {activeTab === "features" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление особенностями
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Название особенности"
                value={featureForm.name}
                onChange={(e) =>
                  setFeatureForm({ ...featureForm, name: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <select
                value={featureForm.maskId}
                onChange={(e) =>
                  setFeatureForm({ ...featureForm, maskId: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black"
              >
                <option value="">Выберите маску</option>
                {masks.map((mask) => (
                  <option key={mask.id} value={mask.id}>
                    {mask.name} (ID: {mask.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleFeatureSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {featureEditingId ? "Обновить" : "Добавить"}
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
                      ID маски
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{feature.id}</td>
                      <td className="p-4 text-black">{feature.name}</td>
                      <td className="p-4 text-black">{feature.maskId}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleFeatureEdit(feature)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleFeatureDelete(feature.id)}
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

        {activeTab === "reviews" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Управление отзывами
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Имя пользователя"
                value={reviewForm.userName}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, userName: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="number"
                placeholder="Рейтинг (1-5)"
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <input
                type="text"
                placeholder="Комментарий"
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
              />
              <select
                value={reviewForm.maskId}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, maskId: e.target.value })
                }
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black"
              >
                <option value="">Выберите маску</option>
                {masks.map((mask) => (
                  <option key={mask.id} value={mask.id}>
                    {mask.name} (ID: {mask.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleReviewSubmit}
                className="px-6 py-3 bg-lime-400 text-white rounded-lg hover:bg-lime-500 transition-colors font-semibold"
              >
                {reviewEditingId ? "Обновить" : "Добавить"}
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
                      Имя пользователя
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Рейтинг
                    </th>
                    <th className="p-4 text-left text-black font-semibold">
                      Комментарий
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
                  {reviews.map((review, index) => (
                    <tr
                      key={review.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-4 text-black">{review.id}</td>
                      <td className="p-4 text-black">{review.userName}</td>
                      <td className="p-4 text-black">{review.rating}</td>
                      <td className="p-4 text-black">
                        {review.comment ?? "-"}
                      </td>
                      <td className="p-4 text-black">{review.maskId ?? "-"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleReviewEdit(review)}
                          className="mr-4 text-lime-400 hover:text-lime-500 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleReviewDelete(review.id)}
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

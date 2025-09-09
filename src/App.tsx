/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";
import "./App.css";

// Интерфейсы для типизации
export interface ExtraField {
  id: number;
  key: string;
  value: string;
  maskId: number;
}

export interface Mask {
  id: number;
  name: string;
  instructions?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  weight?: string;
  viewArea?: string;
  sensors?: number;
  power?: string;
  shadeRange?: string;
  material?: string;
  installment?: string;
  size?: string;
  days?: string;
  operatingTemp?: string;
  weldingTypes?: string;
  responseTime?: string;
  shadeAdjustment?: string;
  batteryIndicator?: string;
  sensitivityAdjustment?: string;
  delayAdjustment?: string;
  testButton?: string;
  hdColorTech?: string;
  gradientFunction?: string;
  memoryModes?: string;
  opticalClass?: string;
  headband?: string;
  sFireProtection?: string;
  packageHeight?: string;
  packageWidth?: string;
  packageLength?: string;
  ExtraField?: ExtraField[];
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
  model: string;              // Модель сварочной маски
  fullName: string;           // Полное наименование
  article: string;            // Артикул
  imageUrl: string;            // Артикул
  viewWindowSize: string;     // Размер смотрового окна
  visibleArea: string;        // Площадь видимой области
  sensorsCount: string;       // Количество сенсоров
  shadeLevel: string;         // Степени затемнения
  lightState: string;         // Светлое состояние
  weldingTypes: string;       // Подходящие виды сварки
  responseTime: string;       // Время срабатывания
  operatingTemp: string;      // Температура эксплуатации
  shadeAdjustment: string;    // Регулировка затемнения
  batteryIndicator: string;   // Индикатор низкого заряда батареи
  sensitivityAdjustment: string; // Регулировка чувствительности
  delayAdjustment: string;    // Регулировка времени задержки
  testButton: string;         // Кнопка тест
  hdColorTech: string;        // Технология естественной цветопередачи HD COLOR
  gradientFunction: string;   // Функция «GRADIENT»
  memoryModes: string;        // Память режимов
  opticalClass: string;       // Оптический класс
  headband: string;           // Оголовье
  body: string;               // Корпус
  sFireProtection: string;    // Технология защиты корпуса S-FIRE
  weight: string;             // Масса нетто, кг
  retailPrice: string;        // Розничная цена
  packageHeight: string;      // Высота упаковки мм
  packageWidth: string;       // Ширина упаковки мм
  packageLength: string;      // Длинна упаковки мм
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
    model: "",
    fullName: "",
    article: "",
    viewWindowSize: "",
    visibleArea: "",
    sensorsCount: "",
    shadeLevel: "",
    lightState: "",
    weldingTypes: "",
    responseTime: "",
    operatingTemp: "",
    shadeAdjustment: "",
    batteryIndicator: "",
    sensitivityAdjustment: "",
    delayAdjustment: "",
    testButton: "",
    imageUrl: "",
    hdColorTech: "",
    gradientFunction: "",
    memoryModes: "",
    opticalClass: "",
    headband: "",
    body: "",
    sFireProtection: "",
    weight: "",
    retailPrice: "",
    packageHeight: "",
    packageWidth: "",
    packageLength: "",
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
const handleMaskEdit = (mask: any): void => {
  const getExtraValue = (key: string) => {
    const field = mask.ExtraField?.find((f: any) => f.key === key);
    return field ? field.value : "";
  };

  setMaskForm({
    model: mask.name || "",
    fullName: mask.instructions || "",
    imageUrl: mask.imageUrl || "",
    article: mask.description || "",
    viewWindowSize: getExtraValue("Размер смотрового окна") || "",
    visibleArea: mask.viewArea || "",
    sensorsCount: mask.sensors?.toString() || "",
    shadeLevel: mask.shadeRange || "",
    lightState: mask.power || "",
    weldingTypes: mask.weldingTypes || "",
    responseTime: getExtraValue("Время срабатывания") || "",
    operatingTemp: mask.operatingTemp || "",
    shadeAdjustment: getExtraValue("Регулировка затемнения") || "",
    batteryIndicator: getExtraValue("Индикатор батареи") || "",
    sensitivityAdjustment: getExtraValue("Регулировка чувствительности") || "",
    delayAdjustment: getExtraValue("Регулировка времени задержки") || "",
    testButton: getExtraValue("Кнопка тест") || "",
    hdColorTech: getExtraValue("HD COLOR") || "",
    gradientFunction: getExtraValue("GRADIENT") || "",
    memoryModes: getExtraValue("Память режимов") || "",
    opticalClass: getExtraValue("Оптический класс") || "",
    headband: getExtraValue("Оголовье") || "",
    body: mask.material || "",
    sFireProtection: mask.sFireProtection || "",
    weight: mask.weight || "",
    retailPrice: mask.price || "",
    packageHeight: mask.packageHeight || "",
    packageWidth: mask.packageWidth || "",
    packageLength: mask.packageLength || "",
  });

  setExtraFields(
    mask.ExtraField?.filter(
      (f: any) =>
        ![
          "Размер смотрового окна",
          "Время срабатывания",
          "Регулировка затемнения",
          "Индикатор батареи",
          "Регулировка чувствительности",
          "Регулировка времени задержки",
          "Кнопка тест",
          "HD COLOR",
          "GRADIENT",
          "Память режимов",
          "Оптический класс",
          "Оголовье",
        ].includes(f.key)
    ) || []
  );

  setMaskEditingId(mask.id);
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
        sensorsCount: maskForm.sensorsCount ? parseInt(maskForm.sensorsCount) : null,
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
        model: "",
        fullName: "",
        article: "",
        viewWindowSize: "",
        visibleArea: "",
        sensorsCount: "",
        shadeLevel: "",
        lightState: "",
        weldingTypes: "",
        responseTime: "",
        operatingTemp: "",
        shadeAdjustment: "",
        batteryIndicator: "",
        imageUrl: "",
        sensitivityAdjustment: "",
        delayAdjustment: "",
        testButton: "",
        hdColorTech: "",
        gradientFunction: "",
        memoryModes: "",
        opticalClass: "",
        headband: "",
        body: "",
        sFireProtection: "",
        weight: "",
        retailPrice: "",
        packageHeight: "",
        packageWidth: "",
        packageLength: "",
      });
      setMaskEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения маски:", error);
      setError("Не удалось сохранить маску");
    }
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
  placeholder="Модель сварочной маски"
  value={maskForm.model}
  onChange={(e) => setMaskForm({ ...maskForm, model: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Полное наименование"
  value={maskForm.fullName}
  onChange={(e) => setMaskForm({ ...maskForm, fullName: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Фото"
  value={maskForm.imageUrl}
  onChange={(e) => setMaskForm({ ...maskForm, imageUrl: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Артикул"
  value={maskForm.article}
  onChange={(e) => setMaskForm({ ...maskForm, article: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Размер смотрового окна"
  value={maskForm.viewWindowSize}
  onChange={(e) => setMaskForm({ ...maskForm, viewWindowSize: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Площадь видимой области"
  value={maskForm.visibleArea}
  onChange={(e) => setMaskForm({ ...maskForm, visibleArea: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="number"
  placeholder="Количество сенсоров"
  value={maskForm.sensorsCount}
  onChange={(e) => setMaskForm({ ...maskForm, sensorsCount: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Степени затемнения"
  value={maskForm.shadeLevel}
  onChange={(e) => setMaskForm({ ...maskForm, shadeLevel: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Светлое состояние"
  value={maskForm.lightState}
  onChange={(e) => setMaskForm({ ...maskForm, lightState: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Подходящие виды сварки"
  value={maskForm.weldingTypes}
  onChange={(e) => setMaskForm({ ...maskForm, weldingTypes: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Время срабатывания"
  value={maskForm.responseTime}
  onChange={(e) => setMaskForm({ ...maskForm, responseTime: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Температура эксплуатации"
  value={maskForm.operatingTemp}
  onChange={(e) => setMaskForm({ ...maskForm, operatingTemp: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Регулировка затемнения"
  value={maskForm.shadeAdjustment}
  onChange={(e) => setMaskForm({ ...maskForm, shadeAdjustment: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Индикатор низкого заряда батареи"
  value={maskForm.batteryIndicator}
  onChange={(e) => setMaskForm({ ...maskForm, batteryIndicator: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Регулировка чувствительности"
  value={maskForm.sensitivityAdjustment}
  onChange={(e) => setMaskForm({ ...maskForm, sensitivityAdjustment: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Регулировка времени задержки"
  value={maskForm.delayAdjustment}
  onChange={(e) => setMaskForm({ ...maskForm, delayAdjustment: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Кнопка тест"
  value={maskForm.testButton}
  onChange={(e) => setMaskForm({ ...maskForm, testButton: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Технология естественной цветопередачи HD COLOR"
  value={maskForm.hdColorTech}
  onChange={(e) => setMaskForm({ ...maskForm, hdColorTech: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Функция «GRADIENT»"
  value={maskForm.gradientFunction}
  onChange={(e) => setMaskForm({ ...maskForm, gradientFunction: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Память режимов"
  value={maskForm.memoryModes}
  onChange={(e) => setMaskForm({ ...maskForm, memoryModes: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Оптический класс"
  value={maskForm.opticalClass}
  onChange={(e) => setMaskForm({ ...maskForm, opticalClass: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Оголовье"
  value={maskForm.headband}
  onChange={(e) => setMaskForm({ ...maskForm, headband: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Корпус"
  value={maskForm.body}
  onChange={(e) => setMaskForm({ ...maskForm, body: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Технология защиты корпуса S-FIRE"
  value={maskForm.sFireProtection}
  onChange={(e) => setMaskForm({ ...maskForm, sFireProtection: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Масса нетто, кг"
  value={maskForm.weight}
  onChange={(e) => setMaskForm({ ...maskForm, weight: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Розничная цена"
  value={maskForm.retailPrice}
  onChange={(e) => setMaskForm({ ...maskForm, retailPrice: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Высота упаковки мм"
  value={maskForm.packageHeight}
  onChange={(e) => setMaskForm({ ...maskForm, packageHeight: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Ширина упаковки мм"
  value={maskForm.packageWidth}
  onChange={(e) => setMaskForm({ ...maskForm, packageWidth: e.target.value })}
  className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-black placeholder:text-black/60"
/>
<input
  type="text"
  placeholder="Длинна упаковки мм"
  value={maskForm.packageLength}
  onChange={(e) => setMaskForm({ ...maskForm, packageLength: e.target.value })}
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
    <th className="p-4 text-left text-black font-semibold">ID</th>
    <th className="p-4 text-left text-black font-semibold">Модель</th>
    <th className="p-4 text-left text-black font-semibold">Полное наименование</th>
    <th className="p-4 text-left text-black font-semibold">Картинка</th>
    <th className="p-4 text-left text-black font-semibold">Артикул</th>
    <th className="p-4 text-left text-black font-semibold">Размер смотрового окна</th>
    <th className="p-4 text-left text-black font-semibold">Площадь видимой области</th>
    <th className="p-4 text-left text-black font-semibold">Количество сенсоров</th>
    <th className="p-4 text-left text-black font-semibold">Степени затемнения</th>
    <th className="p-4 text-left text-black font-semibold">Светлое состояние</th>
    <th className="p-4 text-left text-black font-semibold">Подходящие виды сварки</th>
    <th className="p-4 text-left text-black font-semibold">Время срабатывания</th>
    <th className="p-4 text-left text-black font-semibold">Температура эксплуатации</th>
    <th className="p-4 text-left text-black font-semibold">Регулировка затемнения</th>
    <th className="p-4 text-left text-black font-semibold">Индикатор батареи</th>
    <th className="p-4 text-left text-black font-semibold">Регулировка чувствительности</th>
    <th className="p-4 text-left text-black font-semibold">Регулировка времени задержки</th>
    <th className="p-4 text-left text-black font-semibold">Кнопка тест</th>
    <th className="p-4 text-left text-black font-semibold">HD COLOR</th>
    <th className="p-4 text-left text-black font-semibold">Функция GRADIENT</th>
    <th className="p-4 text-left text-black font-semibold">Память режимов</th>
    <th className="p-4 text-left text-black font-semibold">Оптический класс</th>
    <th className="p-4 text-left text-black font-semibold">Оголовье</th>
    <th className="p-4 text-left text-black font-semibold">Корпус</th>
    <th className="p-4 text-left text-black font-semibold">S-FIRE защита</th>
    <th className="p-4 text-left text-black font-semibold">Масса нетто, кг</th>
    <th className="p-4 text-left text-black font-semibold">Розничная цена</th>
    <th className="p-4 text-left text-black font-semibold">Высота упаковки мм</th>
    <th className="p-4 text-left text-black font-semibold">Ширина упаковки мм</th>
    <th className="p-4 text-left text-black font-semibold">Длинна упаковки мм</th>
    <th className="p-4 text-left text-black font-semibold">Доп. характеристики</th>
    <th className="p-4 text-left text-black font-semibold">Действия</th>
  </tr>
</thead>
<tbody>
  {masks.map((mask, index) => (
    <tr
      key={mask.id}
      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
    >
  <td className="p-4 text-black">{mask.id}</td>
<td className="p-4 text-black">{mask.name ?? "-"}</td>
<td className="p-4 text-black">{mask.instructions ?? "-"}</td>
<td className="p-4 text-black">
  {mask.imageUrl ? (
    <img
      src={mask.imageUrl}
      alt="preview"
      className="max-w-[120px] max-h-[80px] object-contain"
    />
  ) : (
    "-"
  )}
</td><td className="p-4 text-black">{mask.description ?? "-"}</td>
<td className="p-4 text-black">{mask.viewArea ?? "-"}</td>
<td className="p-4 text-black">{mask.sensors ?? "-"}</td>
<td className="p-4 text-black">{mask.shadeRange ?? "-"}</td>
<td className="p-4 text-black">{mask.power ?? "-"}</td>
<td className="p-4 text-black">{mask.weldingTypes ?? "-"}</td>
<td className="p-4 text-black">{mask.responseTime ?? "-"}</td>
<td className="p-4 text-black">{mask.operatingTemp ?? "-"}</td>
<td className="p-4 text-black">{mask.batteryIndicator ?? "-"}</td>
<td className="p-4 text-black">{mask.sensitivityAdjustment ?? "-"}</td>
<td className="p-4 text-black">{mask.delayAdjustment ?? "-"}</td>
<td className="p-4 text-black">{mask.testButton ?? "-"}</td>
<td className="p-4 text-black">{mask.hdColorTech ?? "-"}</td>
<td className="p-4 text-black">{mask.gradientFunction ?? "-"}</td>
<td className="p-4 text-black">{mask.memoryModes ?? "-"}</td>
<td className="p-4 text-black">{mask.opticalClass ?? "-"}</td>
<td className="p-4 text-black">{mask.headband ?? "-"}</td>
<td className="p-4 text-black">{mask.material ?? "-"}</td>
<td className="p-4 text-black">{mask.sFireProtection ?? "-"}</td>
<td className="p-4 text-black">{mask.weight ?? "-"}</td>
<td className="p-4 text-black">{mask.price ?? "-"}</td>
<td className="p-4 text-black">{mask.packageHeight ?? "-"}</td>
<td className="p-4 text-black">{mask.packageWidth ?? "-"}</td>
<td className="p-4 text-black">{mask.packageLength ?? "-"}</td>

      <td className="p-4 text-black">
        {mask && mask.ExtraField && mask.ExtraField?.length > 0 ? (
          <ul className="space-y-1">
            {mask.ExtraField.map((f, i) => (
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
                   (ID: {mask.id})
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
                   
                    {/* <th className="p-4 text-left text-black font-semibold">
                      Маска
                    </th> */}
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
                    (ID: {mask.id})
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
                  (ID: {mask.id})
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

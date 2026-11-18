import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { API_URL, api, ApiError, setUnauthorizedHandler, type User } from './src/api/client';
import { fetchPosts, type Post } from './src/api/posts';
import { canManagePost } from './src/auth/post-permissions';

type Screen = 'home' | 'read' | 'login' | 'register' | 'postForm' | 'admin' | 'users' | 'userForm' | 'teachers' | 'teacherEdit' | 'studentEdit';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

function confirmAlert(title: string, message: string, buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[]) {
  if (Platform.OS !== 'web') { Alert.alert(title, message, buttons); return; }
  // Alert.alert com botões não funciona no react-native-web.
  if (window.confirm(`${title}\n${message}`)) buttons.find((button) => button.style !== 'cancel')?.onPress?.();
}

function IconButton({ icon, label, onPress, disabled = false }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={[styles.iconButton, disabled && styles.disabled]}><Ionicons name={icon} size={22} color="#183d38" /></Pressable>;
}

function Button({ title, onPress, disabled = false, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text></Pressable>;
}

function Field({ label, value, onChangeText, multiline = false, secureTextEntry = false, keyboardType = 'default', editable = true }: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean; secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address'; editable?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} editable={editable} style={[styles.input, multiline && styles.textarea]} multiline={multiline} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} /></View>;
}

function PostRead({ postId }: { postId: number }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setPost(null);
    setLoading(true);
    setError(false);
    api.getPost(postId)
      .then((result) => { if (active) setPost(result); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId, retry]);

  if (loading) return <ActivityIndicator accessibilityLabel="Carregando publicação" color="#286455" style={styles.empty} />;
  if (error || !post) return <><Text accessibilityRole="alert" style={styles.error}>Não foi possível carregar a publicação.</Text><Button title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} secondary /></>;
  return <><Text accessibilityRole="header" style={styles.readTitle}>{post.title}</Text><Text style={styles.byline}>Por {post.author}</Text><View style={styles.divider} /><Text style={styles.readContent}>{post.content}</Text></>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [checkingSession, setCheckingSession] = useState(false);
  const [sessionCheckError, setSessionCheckError] = useState(false);
  const [sessionCheckRevision, setSessionCheckRevision] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [selected, setSelected] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoadError, setUsersLoadError] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentLoadError, setStudentLoadError] = useState(false);
  const [studentRetry, setStudentRetry] = useState(0);
  const [deletingStudent, setDeletingStudent] = useState<number | null>(null);
  const deletingStudentRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [postLoadError, setPostLoadError] = useState(false);
  const [postLoadRetry, setPostLoadRetry] = useState(0);
  const [deletingPost, setDeletingPost] = useState<number | null>(null);
  const [userFormReturn, setUserFormReturn] = useState<'admin' | 'users'>('admin');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teacherPage, setTeacherPage] = useState(0);
  const [deletingTeacher, setDeletingTeacher] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherLoadError, setTeacherLoadError] = useState(false);
  const [teacherRetry, setTeacherRetry] = useState(0);
  const savingPost = useRef(false);
  const deletingPostRef = useRef(false);
  const savingUser = useRef(false);
  const deletingTeacherRef = useRef(false);

  useEffect(() => {
    let active = true;
    api.me().then((current) => { if (active) setUser(current); }).catch(() => { if (active) setUser(null); }).finally(() => { if (active) setRestoringSession(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null); setPassword(''); setCheckingSession(false); setScreen('login');
      setError('Sua sessão expirou. Entre novamente.');
    });
    return () => setUnauthorizedHandler(null);
  }, []);
  useEffect(() => {
    if (screen !== 'admin' && screen !== 'postForm') return;
    let active = true;
    setCheckingSession(true); setSessionCheckError(false);
    api.me().then((current) => {
      if (!active) return;
      if (screen === 'postForm' && current.role !== 'teacher' && current.role !== 'admin') {
        setUser(current); setScreen('home');
        Alert.alert('Acesso negado', 'Esta área é restrita a docentes e administradores.');
        return;
      }
      setUser(current);
    }).catch((failure: unknown) => {
      if (!active) return;
      if (failure instanceof ApiError && failure.status === 401) {
        setUser(null); setPassword(''); setScreen('login'); setError('Sua sessão expirou. Entre novamente.');
      } else setSessionCheckError(true);
    }).finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, [screen, sessionCheckRevision]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && (screen === 'admin' || screen === 'postForm')) {
        setCheckingSession(true); setSessionCheckRevision((value) => value + 1);
      }
    });
    return () => subscription.remove();
  }, [screen]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError('');
    const timeout = setTimeout(() => {
      fetchPosts(API_URL, query).then((data) => { if (active) setPosts(data); }).catch(() => { if (active) setListError('Não foi possível carregar as publicações. Verifique a conexão e tente novamente.'); }).finally(() => { if (active) setLoading(false); });
    }, query.trim() ? 300 : 0);
    return () => { active = false; clearTimeout(timeout); };
  }, [query, revision]);

  useEffect(() => {
    if (screen !== 'postForm' || !selected) return;
    let active = true;
    setPostLoading(true);
    setPostLoadError(false);
    api.getPost(selected.id)
      .then((post) => {
        if (active) { setTitle(post.title); setContent(post.content); setAuthor(post.author); }
      })
      .catch(() => { if (active) setPostLoadError(true); })
      .finally(() => { if (active) setPostLoading(false); });
    return () => { active = false; };
  }, [screen, selected?.id, postLoadRetry]);

  useEffect(() => {
    if (screen !== 'teachers' && (screen !== 'teacherEdit' || teacherId === null)) return;
    let active = true;
    setTeacherLoading(true);
    setTeacherLoadError(false);
    const request = screen === 'teachers' ? api.listTeachers() : api.getTeacher(teacherId as number);
    request.then((result) => {
      if (!active) return;
      if (Array.isArray(result)) { setTeachers(result); setTeacherPage((page) => Math.min(page, Math.max(0, Math.ceil(result.length / 8) - 1))); }
      else { setName(result.name); setEmail(result.email); }
    }).catch(() => { if (active) setTeacherLoadError(true); })
      .finally(() => { if (active) setTeacherLoading(false); });
    return () => { active = false; };
  }, [screen, teacherId, teacherRetry]);

  useEffect(() => {
    if (screen !== 'studentEdit' || studentId === null) return;
    let active = true;
    setStudentLoading(true); setStudentLoadError(false);
    api.getStudent(studentId).then((student) => {
      if (active) { setName(student.name); setEmail(student.email); }
    }).catch(() => { if (active) setStudentLoadError(true); })
      .finally(() => { if (active) setStudentLoading(false); });
    return () => { active = false; };
  }, [screen, studentId, studentRetry]);

  function navigate(next: Screen) {
    setError('');
    if (next === 'admin' || next === 'postForm') { setCheckingSession(true); setSessionCheckError(false); }
    setScreen(next);
  }
  function openForm(post?: Post) {
    setSelected(post ?? null); setTitle(''); setContent(''); setAuthor(post ? '' : user?.name ?? ''); setPostLoading(Boolean(post)); setPostLoadError(false); navigate('postForm');
  }
  function openPost(post: Post) {
    setSelected(post); navigate('read');
  }
  async function login() {
    if (!email.trim() || !password) { setError('Informe email e senha.'); return; }
    setBusy(true); setError('');
    try { setUser(await api.login(email.trim(), password)); setPassword(''); navigate('home'); }
    catch { setError('Não foi possível entrar. Verifique seu email e senha.'); }
    finally { setBusy(false); }
  }
  async function registerTeacher() {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 8) { setError('Informe nome, email válido e senha com pelo menos 8 caracteres.'); return; }
    setBusy(true); setError('');
    try { setUser(await api.register({ name: name.trim(), email: email.trim(), password, role })); setPassword(''); navigate('home'); }
    catch { setError('Não foi possível criar a conta. Verifique os dados ou use outro email.'); }
    finally { setBusy(false); }
  }
  async function logout() {
    try { await api.logout(); setUser(null); navigate('home'); }
    catch { Alert.alert('Erro', 'Não foi possível sair. Tente novamente.'); }
  }
  async function savePost() {
    if (savingPost.current || postLoading || postLoadError || !user || (user.role !== 'teacher' && user.role !== 'admin')) return;
    if (!title.trim() || !content.trim() || !author.trim()) { setError('Preencha título, conteúdo e autor.'); return; }
    savingPost.current = true;
    setBusy(true); setError('');
    try {
      const input = { title: title.trim(), content: content.trim(), author: author.trim() };
      if (selected) await api.updatePost(selected.id, input); else await api.createPost(input);
      setRevision((value) => value + 1); navigate('admin');
      Alert.alert('Publicação salva', selected ? 'As alterações foram salvas.' : 'A publicação foi criada.');
    } catch (failure) { if (!(failure instanceof ApiError && failure.status === 401)) setError('Não foi possível salvar a publicação.'); }
    finally { savingPost.current = false; setBusy(false); }
  }
  function removePost(post: Post) {
    if (!canManagePost(user, post) || deletingPostRef.current) return;
    confirmAlert('Excluir publicação?', `Deseja excluir “${post.title}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        if (deletingPostRef.current) return;
        deletingPostRef.current = true; setDeletingPost(post.id);
        try { await api.deletePost(post.id); setPosts((current) => current.filter((item) => item.id !== post.id)); setRevision((value) => value + 1); }
        catch (failure) { if (!(failure instanceof ApiError && failure.status === 401)) Alert.alert('Erro', 'Não foi possível excluir a publicação.'); }
        finally { deletingPostRef.current = false; setDeletingPost(null); }
      } },
    ]);
  }
  async function openUsers() {
    setBusy(true); setUsersLoadError(false); navigate('users');
    try { setUsers(user?.role === 'admin' ? await api.listUsers() : await api.listStudents()); }
    catch { setUsersLoadError(true); }
    finally { setBusy(false); }
  }
  function openUserForm(nextRole: 'teacher' | 'student', returnScreen: 'admin' | 'users') {
    setName(''); setEmail(''); setPassword(''); setRole(nextRole); setUserFormReturn(returnScreen); navigate('userForm');
  }
  function openTeacherEdit(id: number) {
    setTeacherId(id); setName(''); setEmail(''); setTeacherLoading(true); setTeacherLoadError(false); navigate('teacherEdit');
  }
  function openStudentEdit(id: number) {
    setStudentId(id); setName(''); setEmail(''); setStudentLoading(true); setStudentLoadError(false); navigate('studentEdit');
  }
  async function saveStudent() {
    if (savingUser.current || studentLoading || studentLoadError || studentId === null || !user) return;
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Informe nome e email válido.'); return; }
    savingUser.current = true; setBusy(true); setError('');
    try {
      const updated = await api.updateStudent(studentId, { name: name.trim(), email: email.trim() });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      navigate('users');
      Alert.alert('Estudante atualizado', 'As alterações foram salvas.');
    } catch { setError('Não foi possível salvar. Verifique o email e tente novamente.'); }
    finally { savingUser.current = false; setBusy(false); }
  }
  function removeStudent(student: User) {
    if (!user || student.id === user.id || deletingStudentRef.current) return;
    confirmAlert('Excluir estudante?', `Excluir ${student.name}? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        if (deletingStudentRef.current) return;
        deletingStudentRef.current = true; setDeletingStudent(student.id); setError('');
        try {
          await api.deleteStudent(student.id);
          const remaining = users.filter((item) => item.id !== student.id);
          setUsers(remaining);
          setUserPage((page) => Math.min(page, Math.max(0, Math.ceil(remaining.filter((item) => item.role === 'student').length / 8) - 1)));
        } catch { setError('Não foi possível excluir o estudante. Tente novamente.'); }
        finally { deletingStudentRef.current = false; setDeletingStudent(null); }
      } },
    ]);
  }
  function removeTeacher(teacher: User) {
    if (!user || (user.role !== 'admin' && user.role !== 'teacher') || teacher.id === user.id || deletingTeacherRef.current) return;
    confirmAlert('Excluir docente?', `Excluir ${teacher.name}? As publicações existentes serão mantidas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        if (deletingTeacherRef.current) return;
        deletingTeacherRef.current = true; setDeletingTeacher(teacher.id); setError('');
        try {
          await api.deleteTeacher(teacher.id);
          const remaining = teachers.filter((item) => item.id !== teacher.id);
          setTeachers(remaining);
          setTeacherPage((page) => Math.min(page, Math.max(0, Math.ceil(remaining.length / 8) - 1)));
        } catch { setError('Não foi possível excluir o docente. Tente novamente.'); }
        finally { deletingTeacherRef.current = false; setDeletingTeacher(null); }
      } },
    ]);
  }
  async function saveTeacher() {
    if (savingUser.current || teacherLoading || teacherLoadError || teacherId === null || !user || (user.role !== 'teacher' && user.role !== 'admin')) return;
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Informe nome e email válido.'); return; }
    savingUser.current = true; setBusy(true); setError('');
    try {
      const updated = await api.updateTeacher(teacherId, { name: name.trim(), email: email.trim() });
      if (updated.id === user.id) setUser(updated);
      navigate('teachers');
      Alert.alert('Docente atualizado', 'As alterações foram salvas.');
    } catch { setError('Não foi possível salvar. Verifique o email e tente novamente.'); }
    finally { savingUser.current = false; setBusy(false); }
  }
  async function saveUser() {
    if (savingUser.current || !user || (role === 'teacher' && user.role !== 'teacher' && user.role !== 'admin')) return;
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 8) { setError('Informe nome, email válido e senha com pelo menos 8 caracteres.'); return; }
    savingUser.current = true;
    setBusy(true); setError('');
    try {
      const input = { name: name.trim(), email: email.trim(), password };
      if (role === 'teacher') await api.createTeacher(input); else await api.createStudent(input);
      setName(''); setEmail(''); setPassword('');
      if (userFormReturn === 'users') await openUsers(); else navigate('admin');
      Alert.alert('Cadastro concluído', role === 'teacher' ? 'Docente cadastrado com sucesso.' : 'Estudante cadastrado com sucesso.');
    }
    catch { setError('Não foi possível cadastrar o usuário. Verifique os dados e tente novamente.'); }
    finally { savingUser.current = false; setBusy(false); }
  }

  const canManagePosts = user?.role === 'teacher' || user?.role === 'admin';
  const visibleUsers = users.filter((item) => item.role === role);
  const pageCount = Math.max(1, Math.ceil(visibleUsers.length / 8));
  const teacherPageCount = Math.max(1, Math.ceil(teachers.length / 8));
  const heading: Record<Screen, string> = { home: 'Publicações', read: 'Leitura', login: 'Entrar', register: 'Criar conta', postForm: selected ? 'Editar publicação' : 'Nova publicação', admin: 'Administração', users: 'Pessoas', userForm: 'Novo cadastro', teachers: 'Docentes', teacherEdit: 'Editar docente', studentEdit: 'Editar estudante' };

  if ((screen === 'admin' || screen === 'postForm') && (checkingSession || sessionCheckError)) {
    return <SafeAreaView style={styles.safe}><View style={styles.page}>{checkingSession ? <ActivityIndicator accessibilityLabel="Verificando sessão" color="#286455" /> : <><Text accessibilityRole="alert" style={styles.error}>Não foi possível verificar sua sessão. Confira sua conexão.</Text><Button title="Tentar novamente" onPress={() => { setCheckingSession(true); setSessionCheckRevision((value) => value + 1); }} /><Button title="Voltar" onPress={() => navigate('home')} secondary /></>}</View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <View style={styles.topbar}>
      {screen !== 'home' ? <IconButton icon="arrow-back" label="Voltar" disabled={((screen === 'postForm' || screen === 'userForm' || screen === 'teacherEdit' || screen === 'studentEdit') && busy) || (screen === 'users' && deletingStudent !== null)} onPress={() => navigate(screen === 'postForm' || screen === 'teachers' || screen === 'users' ? 'admin' : screen === 'register' ? 'login' : screen === 'teacherEdit' ? 'teachers' : screen === 'studentEdit' ? 'users' : screen === 'userForm' ? userFormReturn : 'home')} /> : <View style={styles.brandMark}><Text style={styles.brandMarkText}>B</Text></View>}
      <View style={styles.brand}><Text style={styles.brandName}>BLOG ESCOLAR</Text><Text style={styles.brandSub}>Comunidade em palavras</Text></View>
      {user ? <IconButton icon="log-out-outline" label="Sair" disabled={((screen === 'postForm' || screen === 'userForm' || screen === 'teacherEdit' || screen === 'studentEdit') && busy) || deletingStudent !== null} onPress={logout} /> : <IconButton icon="person-circle-outline" label="Entrar" disabled={restoringSession} onPress={() => navigate('login')} />}
    </View>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {screen === 'home' ? <FlatList
        data={loading || listError ? [] : posts}
        keyExtractor={(post) => String(post.id)}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<><View style={styles.intro}><Text style={styles.eyebrow}>NOSSA COMUNIDADE</Text><Text style={styles.heading}>Histórias que{ '\n' }nos conectam.</Text><Text style={styles.introText}>Ideias, descobertas e experiências da nossa escola.</Text></View><View style={styles.searchBox}><Ionicons name="search-outline" size={21} color="#526e68" /><TextInput accessibilityLabel="Buscar publicações" placeholder="Buscar por palavra-chave" placeholderTextColor="#738b85" value={query} onChangeText={setQuery} style={styles.searchInput} returnKeyType="search" />{query ? <IconButton icon="close" label="Limpar busca" onPress={() => setQuery('')} /> : null}</View><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Publicações</Text>{user && <IconButton icon="settings-outline" label="Administrar publicações" onPress={() => { setQuery(''); setLoading(true); setRevision((value) => value + 1); navigate('admin'); }} />}</View></>}
        renderItem={({ item, index }) => <Pressable accessibilityRole="button" accessibilityLabel={`Ler ${item.title}, por ${item.author}`} onPress={() => openPost(item)} style={styles.postCard}><View style={styles.postTop}><Text style={styles.postNumber}>{String(index + 1).padStart(2, '0')}</Text><Ionicons name="arrow-forward-outline" size={20} color="#315e52" /></View><Text style={styles.postTitle}>{item.title}</Text><Text style={styles.postExcerpt} numberOfLines={3}>{item.content}</Text><Text style={styles.postAuthor}>POR {item.author.toUpperCase()}</Text></Pressable>}
        ListEmptyComponent={loading ? <ActivityIndicator color="#286455" style={styles.empty} /> : listError ? <View style={styles.empty}><Text accessibilityRole="alert" style={styles.error}>{listError}</Text><Button title="Tentar novamente" onPress={() => setRevision((value) => value + 1)} secondary /></View> : <Text style={styles.emptyText}>Nenhuma publicação encontrada.</Text>}
      /> : <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>BLOG ESCOLAR</Text><Text style={styles.pageTitle}>{heading[screen]}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {screen === 'read' && selected && <PostRead postId={selected.id} />}
        {screen === 'login' && <><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry /><Button title={busy ? 'Entrando...' : 'Entrar'} onPress={login} disabled={busy} /><Button title="Criar conta de docente" onPress={() => { setName(''); setEmail(''); setPassword(''); setRole('teacher'); navigate('register'); }} disabled={busy} secondary /><Button title="Criar conta de estudante" onPress={() => { setName(''); setEmail(''); setPassword(''); setRole('student'); navigate('register'); }} disabled={busy} secondary /></>}
        {screen === 'register' && <><Text style={styles.muted}>{role === 'teacher' ? 'Docente' : 'Estudante'}</Text><Field label="Nome" value={name} onChangeText={setName} editable={!busy} /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!busy} /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry editable={!busy} /><Button title={busy ? 'Cadastrando...' : 'Cadastrar'} onPress={registerTeacher} disabled={busy} /></>}
        {screen === 'postForm' && canManagePosts && (postLoading ? <ActivityIndicator accessibilityLabel="Carregando publicação para edição" color="#286455" style={styles.empty} /> : postLoadError ? <><Text accessibilityRole="alert" style={styles.error}>Não foi possível carregar a publicação para edição.</Text><Button title="Tentar novamente" onPress={() => setPostLoadRetry((value) => value + 1)} secondary /></> : <><Field label="Título" value={title} onChangeText={setTitle} editable={!busy} /><Field label="Autor" value={author} onChangeText={setAuthor} editable={!busy} /><Field label="Conteúdo" value={content} onChangeText={setContent} multiline editable={!busy} /><Button title={busy ? 'Salvando...' : selected ? 'Salvar alterações' : 'Publicar'} onPress={savePost} disabled={busy} /></>)}
        {screen === 'admin' && user && <><Text style={styles.muted}>Olá, {user.name}.</Text>{canManagePosts && <><Button title="Nova publicação" onPress={() => openForm()} /><Button title="Cadastrar docente" onPress={() => openUserForm('teacher', 'admin')} secondary /><Button title="Listar docentes" onPress={() => { setTeacherPage(0); setTeacherLoading(true); navigate('teachers'); }} secondary /></>}<Button title="Cadastrar estudante" onPress={() => openUserForm('student', 'admin')} secondary /><Button title="Listar estudantes" onPress={() => { setRole('student'); setUserPage(0); openUsers(); }} secondary />{user.role === 'admin' && <Button title="Gerenciar pessoas" onPress={openUsers} secondary />}{canManagePosts && <><Text style={styles.sectionTitle}>Publicações</Text>{loading ? <ActivityIndicator color="#286455" /> : listError ? <><Text accessibilityRole="alert" style={styles.error}>{listError}</Text><Button title="Tentar novamente" onPress={() => setRevision((value) => value + 1)} secondary /></> : posts.length === 0 ? <Text style={styles.emptyText}>Nenhuma publicação para administrar.</Text> : posts.map((post) => <View key={post.id} style={styles.adminRow}><View style={styles.flex}><Text style={styles.rowTitle}>{post.title}</Text><Text style={styles.muted}>Por {post.author}</Text></View>{canManagePost(user, post) && <><IconButton icon="create-outline" label={`Editar ${post.title}`} disabled={deletingPost !== null} onPress={() => openForm(post)} /><IconButton icon="trash-outline" label={`Excluir ${post.title}`} disabled={deletingPost !== null} onPress={() => removePost(post)} /></>}</View>)}</>}</>}
        {(screen === 'teachers' || screen === 'teacherEdit') && canManagePosts && (teacherLoading ? <ActivityIndicator accessibilityLabel="Carregando docentes" color="#286455" style={styles.empty} /> : teacherLoadError ? <><Text accessibilityRole="alert" style={styles.error}>Não foi possível carregar os dados. Tente novamente.</Text><Button title="Tentar novamente" onPress={() => { setTeacherLoading(true); setTeacherRetry((value) => value + 1); }} secondary /></> : screen === 'teachers' ? teachers.length === 0 ? <Text style={styles.emptyText}>Nenhum docente encontrado.</Text> : <>{teachers.slice(teacherPage * 8, teacherPage * 8 + 8).map((teacher) => <View key={teacher.id} style={styles.adminRow}><View style={styles.flex}><Text style={styles.rowTitle}>{teacher.name}</Text><Text style={styles.muted}>{teacher.email}</Text></View><IconButton icon="create-outline" label={`Editar ${teacher.name}`} disabled={deletingTeacher !== null} onPress={() => openTeacherEdit(teacher.id)} />{teacher.id !== user.id && <IconButton icon="trash-outline" label={`Excluir ${teacher.name}`} disabled={deletingTeacher !== null} onPress={() => removeTeacher(teacher)} />}</View>)}<View style={styles.pagination}><IconButton icon="chevron-back" label="Página anterior de docentes" disabled={teacherPage === 0 || deletingTeacher !== null} onPress={() => setTeacherPage((page) => page - 1)} /><Text style={styles.muted}>{teacherPage + 1} / {teacherPageCount}</Text><IconButton icon="chevron-forward" label="Próxima página de docentes" disabled={teacherPage >= teacherPageCount - 1 || deletingTeacher !== null} onPress={() => setTeacherPage((page) => page + 1)} /></View></> : <><Field label="Nome" value={name} onChangeText={setName} editable={!busy} /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!busy} /><Button title={busy ? 'Salvando...' : 'Salvar alterações'} onPress={saveTeacher} disabled={busy} /></>)}
        {screen === 'users' && user && <><View style={styles.segments}>{(user.role === 'admin' ? ['teacher', 'student'] as const : ['student'] as const).map((value) => <Pressable accessibilityRole="button" accessibilityState={{ selected: role === value, disabled: deletingStudent !== null }} disabled={deletingStudent !== null} key={value} onPress={() => { setRole(value); setUserPage(0); }} style={[styles.segment, role === value && styles.segmentActive]}><Text style={[styles.segmentText, role === value && styles.segmentTextActive]}>{value === 'teacher' ? 'Docentes' : 'Estudantes'}</Text></Pressable>)}</View><Button title="Novo cadastro" disabled={deletingStudent !== null || busy} onPress={() => openUserForm(role, 'users')} />{busy ? <ActivityIndicator color="#286455" /> : usersLoadError ? <><Text accessibilityRole="alert" style={styles.error}>Não foi possível carregar os usuários.</Text><Button title="Tentar novamente" onPress={openUsers} secondary /></> : visibleUsers.length === 0 ? <Text style={styles.emptyText}>Nenhum cadastro encontrado.</Text> : visibleUsers.slice(userPage * 8, userPage * 8 + 8).map((item) => <View key={item.id} style={styles.adminRow}><View style={styles.flex}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.muted}>{item.email}</Text></View>{item.role === 'student' && <><IconButton icon="create-outline" label={`Editar ${item.name}`} disabled={deletingStudent !== null} onPress={() => openStudentEdit(item.id)} /><IconButton icon="trash-outline" label={`Excluir ${item.name}`} disabled={deletingStudent !== null} onPress={() => removeStudent(item)} /></>}</View>)}{!usersLoadError && !busy && <View style={styles.pagination}><IconButton icon="chevron-back" label="Página anterior" disabled={userPage === 0 || deletingStudent !== null} onPress={() => setUserPage((page) => page - 1)} /><Text style={styles.muted}>{userPage + 1} / {pageCount}</Text><IconButton icon="chevron-forward" label="Próxima página" disabled={userPage >= pageCount - 1 || deletingStudent !== null} onPress={() => setUserPage((page) => page + 1)} /></View>}</>}
        {screen === 'studentEdit' && user && (studentLoading ? <ActivityIndicator accessibilityLabel="Carregando estudante" color="#286455" style={styles.empty} /> : studentLoadError ? <><Text accessibilityRole="alert" style={styles.error}>Não foi possível carregar o estudante.</Text><Button title="Tentar novamente" onPress={() => { setStudentLoading(true); setStudentRetry((value) => value + 1); }} secondary /></> : <><Field label="Nome" value={name} onChangeText={setName} editable={!busy} /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!busy} /><Button title={busy ? 'Salvando...' : 'Salvar alterações'} onPress={saveStudent} disabled={busy} /></>)}
        {screen === 'userForm' && user && (role === 'student' || canManagePosts) && <><Text style={styles.muted}>{role === 'teacher' ? 'Docente' : 'Estudante'}</Text><Field label="Nome" value={name} onChangeText={setName} editable={!busy} /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!busy} /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry editable={!busy} /><Button title={busy ? 'Cadastrando...' : 'Cadastrar'} onPress={saveUser} disabled={busy} /></>}
      </ScrollView>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7f4' }, flex: { flex: 1 },
  topbar: { height: 74, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2eae5' },
  brandMark: { width: 40, height: 40, backgroundColor: '#245c4e', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }, brandMarkText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  brand: { flex: 1, marginLeft: 12 }, brandName: { fontSize: 12, fontWeight: '800', color: '#163d34' }, brandSub: { fontSize: 12, color: '#768b83', marginTop: 2 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 22, paddingBottom: 36 }, intro: { paddingVertical: 32 }, eyebrow: { color: '#b65336', fontSize: 11, fontWeight: '800', marginBottom: 10 },
  heading: { color: '#183d35', fontSize: 34, lineHeight: 40, fontWeight: '800' }, introText: { color: '#5e756b', fontSize: 15, lineHeight: 22, marginTop: 12 },
  searchBox: { minHeight: 54, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d8e3dc', borderRadius: 6, paddingLeft: 15 }, searchInput: { flex: 1, fontSize: 15, color: '#183d35', paddingHorizontal: 10, paddingVertical: 14 },
  sectionHeading: { marginTop: 28, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: '#183d35', fontSize: 20, fontWeight: '700' },
  postCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1e9e3', borderRadius: 6, padding: 20, marginBottom: 12 }, postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, postNumber: { color: '#b65336', fontSize: 12, fontWeight: '800' }, postTitle: { color: '#193d35', fontSize: 21, lineHeight: 27, fontWeight: '700', marginTop: 15 }, postExcerpt: { color: '#63776e', fontSize: 15, lineHeight: 22, marginTop: 9 }, postAuthor: { color: '#526d62', fontSize: 11, fontWeight: '700', marginTop: 18 },
  empty: { marginTop: 24 }, emptyText: { color: '#61766d', fontSize: 15, lineHeight: 22, marginTop: 20 }, error: { color: '#a43c30', fontSize: 15, lineHeight: 22, marginVertical: 12 },
  page: { padding: 24, paddingBottom: 48 }, pageTitle: { fontSize: 29, lineHeight: 35, fontWeight: '800', color: '#183d35', marginBottom: 24 }, readTitle: { fontSize: 27, lineHeight: 34, fontWeight: '700', color: '#183d35' }, byline: { color: '#60776d', fontSize: 14, marginTop: 12 }, divider: { height: 1, backgroundColor: '#dce6df', marginVertical: 24 }, readContent: { color: '#344e44', fontSize: 17, lineHeight: 28 },
  field: { marginBottom: 17 }, label: { color: '#294b40', fontSize: 14, fontWeight: '700', marginBottom: 7 }, input: { borderWidth: 1, borderColor: '#cddbd1', borderRadius: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, color: '#183d35', fontSize: 16, minHeight: 50 }, textarea: { minHeight: 180, textAlignVertical: 'top' },
  button: { minHeight: 50, backgroundColor: '#245c4e', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' }, secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#a7bfb1' }, secondaryButtonText: { color: '#245c4e' }, disabled: { opacity: 0.6 },
  muted: { color: '#647a6f', fontSize: 14, lineHeight: 20, marginBottom: 12 }, adminRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dce6df', paddingVertical: 14 }, rowTitle: { fontSize: 16, fontWeight: '700', color: '#183d35', marginBottom: 4 }, segments: { flexDirection: 'row', backgroundColor: '#e3ece5', borderRadius: 6, padding: 4, marginBottom: 18 }, segment: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 4 }, segmentActive: { backgroundColor: '#fff' }, segmentText: { color: '#647a6f', fontWeight: '600' }, segmentTextActive: { color: '#245c4e' }, pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
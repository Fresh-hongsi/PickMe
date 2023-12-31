// 로그인된 회원만 볼 수 있는 페이지
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Menu, message, Form, Input, Modal } from 'antd';
import { request } from '../../../hoc/request';
import { useDispatch } from 'react-redux';
import { logout } from '../../../_actions/actions'
import { setAuthHeader, setUserRole } from '../../../hoc/request';

const { Item } = Form;
function MyPage() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isInputClicked, setIsInputClicked] = useState(false);

    //드롭다운 관련
    const [selectedOption, setSelectedOption] = useState('info'); //드롭다운(정보수정, 비번 변경, 탈퇴)에서 해당 배너를 클릭할떄마다 selectOption값은 바뀜

    //회원 정보 수정 관련
    const [isUpdateButtonEnabled, setIsUpdateButtonEnabled] = useState(false); //정보 수정 시, 모든 필드가 입력되어야만 버튼이 활성화됨
    const [userBaseInfo, setUserBaseInfo] = useState(null); // 회원의 email, 닉네임, 이름, 포폴 유무 정보를 받아옴. 
    // 회원 정보 업데이트랑 기존 정보 받아올 때 둘 다 사용, 업데이트 할 때는 에 비밀번호까지 실어서 보내고, 
    // 다시 useEffect로 GET- /userInfo할때는 userDto로 받음(비밀번호 필드 누락된 dto만 받음)

    //비밀 번호 변경 관련
    const [currentPassword, setCurrentPassword] = useState(''); //기존 비밀번호를 입력하는 필드
    const [newPassword, setNewPassword] = useState(''); //바꾸려는 비밀번호를 입력하는 필드
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); //바꾸려는 비밀번호를 확인하는 필드
    const [isPasswordUpdateButtonEnabled, setIsPasswordUpdateButtonEnabled] = useState(false); //앞선 세 가지 필드가 다 입력되어야 비밀번호 변경 버튼이 활성화됨

    //회원 탈퇴 관련
    const [currentPasswordForSignOut, setCurrentPasswordForSignOut] = useState(''); //기존 비밀번호를 입력하는 필드
    const [isSignOutButtonEnabled, setIsSignOutButtonEnabled] = useState(false); //기존 비밀번호를 입력하는 필드가 입력되어야 탈퇴하기 버튼이 활성화됨
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false); // 정말로 삭제하시겠습니까? 라는 내용을 보여주는 모달 창을 보여줄지 말지 여부 설정


    // MyPage가 마운트 될 때 /userInfo에서 데이터를 가져와 data에 세팅 -> userDto값이 세팅되어짐
    useEffect(() => {
        request('GET', '/userInfo', {})
            .then((response) => {
                setUserBaseInfo(response.data);
            })
            .catch((error) => {

                console.error("Error fetching data:", error);
            });
    }, []);

    // 회원 정보 수정 관련 - 버튼 활성화를 컨트롤하는 장치
    useEffect(() => {
        // 세 개의 입력 칸(닉네임, 패스워드, 이름)이 모두 입력되면 정보 수정하기 버튼 클릭 가능
        const isRequiredFieldsFilled = userBaseInfo && userBaseInfo.nickName && userBaseInfo.userName && userBaseInfo.password;
        setIsUpdateButtonEnabled(isRequiredFieldsFilled); //만약 하나라도 입력되지 않으면 버튼 활성화되지 않음
    }, [userBaseInfo]);

    // 비밀 번호 변경 관련 - 버튼 활성화를 컨트롤하는 장치
    useEffect(() => {
        // 세 개의 입력 칸(기존 비밀번호, 바꾸려는 비밀번호, 바꾸려는 비밀번호 확인)이 모두 입력되면 비밀번호 변경 버튼 클릭 가능
        const changePasswordFieldFilled = currentPassword && newPassword && confirmNewPassword;
        setIsPasswordUpdateButtonEnabled(changePasswordFieldFilled); //만약 하나라도 입력되지 않으면 버튼 활성화되지 않음

    }, [currentPassword, newPassword, confirmNewPassword]);

    // 회원 탈퇴 관련 - 버튼 활성화를 컨트롤하는 장치
    useEffect(() => {
        // 한 개의 입력 칸(기존 패스워드)가 입력되면 회원 탈퇴하기 버튼 클릭 가능
        const signOutPasswordFieldFilled = currentPasswordForSignOut;
        setIsSignOutButtonEnabled(signOutPasswordFieldFilled); //만약 하나라도 입력되지 않으면 버튼 활성화되지 않음
    }, [currentPasswordForSignOut])


    //드롭다운에서 특정 배너를 클릭하면 변경되는 기능
    const handleMenuClick = (e) => {
        setSelectedOption(e.key);
    };

    //회원 정보 수정 드롭다운 내에서, 필드 값의 변경을 감지하고 세팅하는 장치 - (filedName : nickName, userName, password) / (value : 변경하려는 값)
    const handleInputChange = (fieldName, value) => {
        // prevData로 이전의 회원 정보 변경 관련하여 입력된 필드 상태 값을 가져오고, value를 사용하여 이름이 fieldName인 속성을 추가하거나 업데이트하여 새 상태 값을 반환
        setUserBaseInfo((prevData) => ({ ...prevData, [fieldName]: value }));
    };

    // '회원 정보 변경'과 관련하여 백엔드에 request를 보내고, 그에 대한 response 처리를 하는 곳
    const updateInfo = (updatedData) => {
        if (updatedData.nickName && updatedData.userName && updatedData.password) { //닉네임, 이름, 패스워드가 다 입력되면, 백엔드에 요청을 보냄
            request('PUT', '/updateUserInfo', updatedData)
                .then((response) => {
                    if (response.data === "User information has been successfully updated.") {
                        alert('정보가 업데이트되었습니다.');
                        setUserBaseInfo((prevData) => ({ ...prevData, ...updatedData, password: '' })); //업데이트가 성공적으로 되었음 - 비밀번호 필드는 다시 빈 값으로 세팅
                        navigate('/myPage');
                    }

                    else {
                        console.error('Unknown response:', response.data);
                        message.error('정보 업데이트에 실패했습니다.');
                    }
                })
                .catch((error) => { //백엔드에서 예외를 보냈을 경우
                    if (error.response && error.response.data) { //예외 데이터를 파싱(문자열을 확인)
                        const errorMessage = error.response.data;

                        if (errorMessage === "Passwords do not match") {//비밀번호가 틀렸을 경우
                            message.warning('정보 업데이트에 실패했습니다. 기존의 비밀번호를 올바르게 입력하세요.');

                        } else if (errorMessage === "Nickname already in use") {//닉네임이 중복되는 경우
                            message.error('닉네임이 이미 사용 중입니다. 다른 닉네임을 선택하세요.');

                        } else {
                            message.error('정보 업데이트에 실패했습니다.');
                        }
                    } else {
                        // Handle other errors or network issues
                        console.error('Error updating information:', error);
                        message.error('정보 업데이트 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
                    }
                });
        } else {
            //만약 모든 필드값을 다 입력하지 않은 경우
            message.warning('모든 필수 정보를 입력하세요.');
        }
    };

    // '비밀 번호 변경'과 관련하여 백엔드에 request를 보내고, 그에 대한 response 처리를 하는 곳
    const updatePassword = () => {
        if (newPassword === confirmNewPassword) { //새로운 비밀번호와 새로운 비밀번호 확인 값이 같을 경우에만 백엔드 요청 보냄

            const passwordData = { //백엔드에 보낼 dto객체 생성 ->  UserPasswordUpdateDto(백엔드)

                currentPassword: currentPassword,
                password: newPassword,
                confirmNewPassword: confirmNewPassword
            };

            request('PUT', '/updatePassword', passwordData)
                .then((response) => {
                    if (response.data === "Password updated successfully.") {

                        message.success('비밀번호가 성공적으로 업데이트되었습니다.');
                        setCurrentPassword('')
                        setNewPassword('');
                        setConfirmNewPassword('');
                    } else {

                        console.error('Unknown response:', response.data);
                        message.error('비밀번호 업데이트에 실패했습니다.');
                    }
                })
                .catch((error) => { //백엔드에서 예외를 보냈을 경우

                    if (error.response && error.response.data) { //예외 데이터를 파싱(문자열을 확인)
                        const errorMessage = error.response.data;

                        if (errorMessage === "Current password is incorrect") { //기존의 비밀번호가 틀렸을 경우
                            message.warning('기존 비밀번호를 정확히 입력하세요. 다시 시도하세요.');
                        } else {
                            message.error('비밀번호 업데이트 중 오류가 발생했습니다.');
                        }
                    } else {
                        console.error('Error updating password:', error);
                        message.error('비밀번호 업데이트 중 오류가 발생했습니다.');
                    }
                });
        } else {
            //비밀번호와 비밀번호 확인 필드가 일치하지 않을 경우 백엔드에 따로 요청 안보내고 프런트 내에서 에러메세지 반환
            message.warning('새로운 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        }
    };

    // '회원 탈퇴'와 관련하여 백엔드에 request를 보내고, 그에 대한 response 처리를 하는 곳
    const onSignOutHandler = () => {

        const signOutPasswordData = { //백엔드에 보낼 dto객체 생성 ->  signOuDto(백엔드)
            currentPasswordForSignOut: currentPasswordForSignOut
        };

        request('POST', '/signOut', signOutPasswordData)
            .then((response) => {
                if (response.data === "User has been successfully withdrawn.") {
                    message.success('회원 탈퇴가 완료되었습니다.');
                    setAuthHeader(null); //탈퇴하였으므로 해당 회원의 로컬스토리지에 있는 토큰을 비우기
                    setUserRole(null); //탈퇴하였으므로 해당 회원의 로컬스토리지에 있는 role을 비우기
                    localStorage.clear();  //로컬스토리지 클리어 반드시 해주기!! 얘 안하면 로그아웃 상태에서 새로고침 시 랜딩페이지가 렌더링되지 않음!!
                    dispatch(logout()); //로그 아웃 상태로 전환
                    navigate('/');
                }
                else {

                    console.error('Unknown response:', response.data);
                    message.error('회원 탈퇴에 실패했습니다.');
                }
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    const errorMessage = error.response.data;

                    if (errorMessage === "Current password is incorrect") { //기존의 비밀번호가 틀렸을 경우
                        message.warning('기존 비밀번호를 정확히 입력하세요. 다시 시도하세요.');
                    } else {
                        message.warning('회원 탈퇴에 실패했습니다.');
                    }
                } else {
                    console.error("Error signing out:", error);
                    message.warning('회원 탈퇴에 실패했습니다.');
                }
            });
    }

    // 확인 버튼을 누른 경우
    const handleWithdrawConfirm = () => {
        setIsWithdrawModalVisible(false); // Close the modal
        onSignOutHandler(); // Call the function to perform account withdrawal
    };
    
    // 취소 버튼을 누른 경우
    const handleWithdrawCancel = () => {
        setIsWithdrawModalVisible(false); // Close the modal
    };
    

    return (
        <div>
            <div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '25%' }}>
                        <Menu mode="vertical" selectedKeys={[selectedOption]} onClick={handleMenuClick}>
                            <Menu.Item key="info">정보 수정</Menu.Item>
                            <Menu.Item key="password">비밀번호 변경</Menu.Item>
                            <Menu.Item key="withdrawal">회원 탈퇴</Menu.Item>
                        </Menu>
                    </div>
                    <div style={{ width: '75%' }}>
                        {selectedOption === 'info' && (
                            <Card title="정보 수정" style={{ width: '100%' }}>
                                {userBaseInfo && (
                                    <Form>
                                        <div>
                                            <Item label="등록된 이메일 주소">
                                                <Input
                                                    type="email"
                                                    value={userBaseInfo.email}
                                                    readOnly
                                                    disabled // Prevent interaction with the field
                                                    style={{ backgroundColor: '#f0f0f0' }} />
                                            </Item>
                                        </div>
                                        <div>
                                            <Item label="닉네임">
                                                <Input
                                                    type="text"
                                                    value={userBaseInfo.nickName}
                                                    placeholder = "닉네임을 입력해주세요"
                                                    onChange={(e) => handleInputChange('nickName', e.target.value)} 
                                                    />
                                            </Item>
                                        </div>
                                        <div>
                                            <Item label="이름">
                                                <Input
                                                    type="text"
                                                    value={userBaseInfo.userName}
                                                    placeholder="이름을 입력해주세요"
                                                    onChange={(e) => handleInputChange('userName', e.target.value)} />
                                            </Item>
                                        </div>
                                        <div>
                                            <Item label="패스워드">
                                                <Input
                                                    type="password"
                                                    value={userBaseInfo.password || ''} //비밀번호는 백엔드에서 가져오지 못했으므로 빈칸으로 세팅
                                                    placeholder="비밀번호를 입력해주세요"
                                                    onChange={(e) => handleInputChange('password', e.target.value)} />
                                            </Item>
                                        </div>

                                        <Button type="primary" onClick={() => updateInfo(userBaseInfo)}
                                            disabled={!isUpdateButtonEnabled}>
                                            정보 업데이트
                                        </Button>
                                    </Form>
                                )}
                            </Card>
                        )}
                        {selectedOption === 'password' && (
                            <Card title="비밀번호 변경" style={{ width: '100%' }}>
                                <Form>
                                    <div>
                                        <Item label="등록된 이메일 주소">
                                            <Input
                                                type="email"
                                                value={userBaseInfo.email} //이메일은 화면에 보여주되, 변경 불가능하게 disable설정
                                                readOnly
                                                disabled
                                                style={{ backgroundColor: '#f0f0f0' }}
                                            />
                                        </Item>
                                    </div>
                                    <div>
                                        <Item label="기존 비밀번호">
                                            <Input
                                                type="password"
                                                value={currentPassword}
                                                placeholder="기존에 사용하던 비밀번호를 입력해주세요"
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </Item>
                                    </div>
                                    <div>
                                        <Item label="새로운 비밀번호">
                                            <Input
                                                type="password"
                                                value={newPassword}
                                                placeholder = "기존 비밀번호와 다른 비밀번호를 입력해주세요"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </Item>
                                    </div>
                                    <div>
                                        <Item label="새로운 비밀번호 확인">
                                            <Input
                                                type="password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            />
                                        </Item>
                                    </div>
                                    <Button
                                        type="primary"
                                        onClick={updatePassword}
                                        disabled={!isPasswordUpdateButtonEnabled}
                                    >
                                        비밀번호 변경
                                    </Button>
                                </Form>
                            </Card>
                        )}
                        {selectedOption === 'withdrawal' && (
                            <Card title="회원 탈퇴" style={{ width: '100%' }}>
                                <Item label="기존 비밀번호">
                                    <Input
                                        type="password"
                                        value={currentPasswordForSignOut}
                                        onChange={(e) => setCurrentPasswordForSignOut(e.target.value)}
                                    />
                                </Item>
                                {/* 탈퇴 버튼 */}
                                <Button
                                    type="primary"
                                    onClick={() => setIsWithdrawModalVisible(true)}
                                    disabled={!isSignOutButtonEnabled}>
                                    탈퇴하기
                                </Button>
                                {/** Ok와 Cancel 함수가 크로스 되어 있음 */}
                                <Modal
                                    title="회원 탈퇴 확인"
                                    open={isWithdrawModalVisible}
                                    onOk={handleWithdrawCancel}
                                    onCancel={handleWithdrawConfirm}
                                    okText="아니오"
                                    cancelText="네"
                                >
                                    <p>정말로 탈퇴하시겠습니까?</p>
                                </Modal>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <Row justify="center" style={{ marginTop: '20px' }}>
                    <Col xs={24} sm={16} md={12} lg={8}>
                        <Card title="Backend Response in Project Page" style={{ width: '100%' }}>
                            <div>현재 계정 정보</div>
                            {userBaseInfo && (
                                <ul>
                                    {/** data로 받아온 Boolean 값은, data.isCreated만으로는 화면에 나타나지 않는다.
                                     * 따라서 ?를 사용하여 참일때 true가 보이고, 거짓일 때 false가 보이도록 설정한다.
                                     */}
                                    <li><strong>isCreated:</strong> {userBaseInfo.isCreated ? 'true' : 'false'}</li>
                                    <li><strong>User Name:</strong> {userBaseInfo.userName}</li>
                                    <li><strong>Nick Name:</strong> {userBaseInfo.nickName}</li>
                                    <li><strong>Email:</strong> {userBaseInfo.email}</li>
                                    {/* Add other properties as needed */}
                                </ul>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );

}

export default MyPage;
package PickMe.PickMeDemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupPostsListDto {

    private Long id;
    private String writerNickName;
    private List<String> applyNickNames;
    private String title;
    private String postType;
    private Boolean web;
    private Boolean app;
    private Boolean game;
    private Boolean ai;
    private Integer counts;
    private Integer recruitmentCount;
    private LocalDate endDate;
    private List<Boolean> approved; // 한 게시물에 대해 모든 유저에 대한 승인 여부. writer가 보는 용도로 사용
    private Boolean isApproved; // 특정 유저의 승인 여부. applicant가 보는 용도로 사용
    private Boolean isFull;     // 정원이 모두 찼는지 체크.

}
